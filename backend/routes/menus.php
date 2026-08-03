<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/response.php';

function menu_list(): never
{
    $stmt = db()->prepare(<<<'SQL'
        SELECT m.id, m.title, m.created_by, m.created_at, m.updated_at,
               COUNT(mi.id) AS item_count,
               ROUND(SUM(
                   CASE r.calorie_unit
                       WHEN 'kcal/100g' THEN r.calorie_value * (mi.quantity / 100.0)
                       ELSE                   r.calorie_value * mi.quantity
                   END
               ), 1) AS total_kcal
          FROM menus m
          LEFT JOIN menu_items mi ON mi.menu_id = m.id
          LEFT JOIN recipes r ON r.id = mi.recipe_id
         GROUP BY m.id
         ORDER BY m.updated_at DESC, m.id DESC
        SQL
    );
    $stmt->execute();
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['item_count'] = (int) $row['item_count'];
        $row['total_kcal'] = $row['total_kcal'] !== null ? (float) $row['total_kcal'] : null;
    }
    unset($row);

    json_response(['menus' => $rows]);
}

function menu_get(string $id): never
{
    $menu = find_menu((int) $id);

    if ($menu === null) {
        json_error('A menü nem található.', 404);
    }

    $stmt = db()->prepare(<<<'SQL'
        SELECT mi.id, mi.recipe_id, mi.quantity, mi.sort_order,
               r.title AS recipe_title,
               r.calorie_value AS recipe_kcal,
               r.calorie_unit AS recipe_unit,
               ROUND(
                   CASE r.calorie_unit
                       WHEN 'kcal/100g' THEN r.calorie_value * (mi.quantity / 100.0)
                       ELSE                   r.calorie_value * mi.quantity
                   END, 1
               ) AS item_kcal
          FROM menu_items mi
          JOIN recipes r ON r.id = mi.recipe_id
         WHERE mi.menu_id = :menu_id
         ORDER BY mi.sort_order, mi.id
        SQL
    );
    $stmt->execute(['menu_id' => $menu['id']]);
    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item['quantity'] = (float) $item['quantity'];
        $item['recipe_kcal'] = $item['recipe_kcal'] !== null ? (float) $item['recipe_kcal'] : null;
        $item['item_kcal'] = $item['item_kcal'] !== null ? (float) $item['item_kcal'] : null;
    }
    unset($item);

    $menu['items'] = $items;

    json_response(['menu' => $menu]);
}

function menu_create(): never
{
    $user = require_auth();
    $data = read_menu_input();
    $pdo = db();

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO menus (title, created_by) VALUES (:title, :created_by)'
        );
        $stmt->execute([
            'title' => $data['title'],
            'created_by' => $user['id'],
        ]);

        $menuId = (int) $pdo->lastInsertId();
        insert_menu_items($pdo, $menuId, $data['items']);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log((string) $e);
        json_error('A menü mentése közben hiba történt.', 500);
    }

    json_response(['menu' => ['id' => $menuId]], 201);
}

function menu_update(string $id): never
{
    require_auth();

    $menu = find_menu((int) $id);

    if ($menu === null) {
        json_error('A menü nem található.', 404);
    }

    $data = read_menu_input();
    $pdo = db();

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare(
            "UPDATE menus SET title = :title, updated_at = datetime('now') WHERE id = :id"
        );
        $stmt->execute([
            'title' => $data['title'],
            'id' => $menu['id'],
        ]);

        $pdo->prepare('DELETE FROM menu_items WHERE menu_id = :id')
            ->execute(['id' => $menu['id']]);
        insert_menu_items($pdo, $menu['id'], $data['items']);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log((string) $e);
        json_error('A menü mentése közben hiba történt.', 500);
    }

    json_response(['menu' => ['id' => $menu['id']]]);
}

function menu_delete(string $id): never
{
    require_admin();

    $stmt = db()->prepare('DELETE FROM menus WHERE id = :id');
    $stmt->execute(['id' => (int) $id]);

    if ($stmt->rowCount() === 0) {
        json_error('A menü nem található.', 404);
    }

    json_response(['status' => 'ok']);
}

function find_menu(int $id): ?array
{
    $stmt = db()->prepare(<<<'SQL'
        SELECT m.id, m.title, m.created_by, m.created_at, m.updated_at,
               COUNT(mi.id) AS item_count,
               ROUND(SUM(
                   CASE r.calorie_unit
                       WHEN 'kcal/100g' THEN r.calorie_value * (mi.quantity / 100.0)
                       ELSE                   r.calorie_value * mi.quantity
                   END
               ), 1) AS total_kcal
          FROM menus m
          LEFT JOIN menu_items mi ON mi.menu_id = m.id
          LEFT JOIN recipes r ON r.id = mi.recipe_id
         WHERE m.id = :id
         GROUP BY m.id
        SQL
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if ($row === false) {
        return null;
    }

    $row['item_count'] = (int) $row['item_count'];
    $row['total_kcal'] = $row['total_kcal'] !== null ? (float) $row['total_kcal'] : null;

    return $row;
}

function read_menu_input(): array
{
    $body = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($body)) {
        json_error('Érvénytelen kérés.', 400);
    }

    $title = trim((string) ($body['title'] ?? ''));

    if ($title === '') {
        json_error('A menü címe kötelező!', 400);
    }

    $items = $body['items'] ?? [];

    if (!is_array($items)) {
        json_error('Érvénytelen menü elemek.', 400);
    }

    $result = [];

    foreach ($items as $i => $item) {
        $recipeId = (int) ($item['recipe_id'] ?? 0);
        $quantity = (float) ($item['quantity'] ?? 0);

        if ($recipeId <= 0 || $quantity <= 0) {
            continue;
        }

        $result[] = [
            'recipe_id' => $recipeId,
            'quantity' => $quantity,
            'sort_order' => $i,
        ];
    }

    return ['title' => $title, 'items' => $result];
}

function insert_menu_items(PDO $pdo, int $menuId, array $items): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO menu_items (menu_id, recipe_id, quantity, sort_order)
         VALUES (:menu_id, :recipe_id, :quantity, :sort_order)'
    );

    foreach ($items as $item) {
        $stmt->execute([
            'menu_id' => $menuId,
            'recipe_id' => $item['recipe_id'],
            'quantity' => $item['quantity'],
            'sort_order' => $item['sort_order'],
        ]);
    }
}
