<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/push.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/upload.php';

const CALORIE_UNITS = ['kcal/100g', 'kcal/adag', 'kcal/db'];

function recipe_list(): never
{
    $rows = db()->query(
        'SELECT id, title, description,
                CASE WHEN image_blob IS NOT NULL THEN 1 ELSE 0 END AS has_image,
                calorie_value, calorie_unit, created_by, created_at, updated_at
         FROM recipes
         ORDER BY updated_at DESC, id DESC'
    )->fetchAll();

    foreach ($rows as &$row) {
        set_image_urls($row);
        $row['has_image'] = (bool) $row['has_image'];
        $row['calorie_value'] = $row['calorie_value'] === null ? null : (float) $row['calorie_value'];
    }
    unset($row);

    json_response(['recipes' => $rows]);
}

function recipe_get(string $id): never
{
    $recipe = find_recipe((int) $id);

    if ($recipe === null) {
        json_error('A recept nem található.', 404);
    }

    $pdo = db();

    $ingredients = $pdo->prepare('SELECT quantity, name FROM ingredients WHERE recipe_id = :id ORDER BY sort_order, id');
    $ingredients->execute(['id' => $recipe['id']]);

    $steps = $pdo->prepare('SELECT step_number, instruction FROM steps WHERE recipe_id = :id ORDER BY step_number, id');
    $steps->execute(['id' => $recipe['id']]);

    $recipe['ingredients'] = $ingredients->fetchAll();
    $recipe['steps'] = $steps->fetchAll();

    json_response(['recipe' => $recipe]);
}

function recipe_create(): never
{
    $user = require_auth();

    $pdo = db();
    $data = read_recipe_input();

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare(
            'INSERT INTO recipes
                (title, description, image_blob, thumbnail_blob, image_type, calorie_value, calorie_unit, created_by)
             VALUES (:title, :description, :image, :thumbnail, :image_type, :calorie_value, :calorie_unit, :created_by)'
        );
        bind_recipe($stmt, $data, $user['id']);
        $stmt->execute();

        $recipeId = (int) $pdo->lastInsertId();
        insert_ingredients($pdo, $recipeId, $data['ingredients']);
        insert_steps($pdo, $recipeId, $data['steps']);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log((string) $e);
        json_error('A recept mentése közben hiba történt.', 500);
    }

    push_notify('Új recept hozzáadva', $data['title'], '/recipe/' . $recipeId);

    json_response(['recipe' => ['id' => $recipeId]], 201);
}

function recipe_update(string $id): never
{
    require_auth();

    $recipe = find_recipe((int) $id);

    if ($recipe === null) {
        json_error('A recept nem található.', 404);
    }

    $pdo = db();
    $data = read_recipe_input();
    $newImage = $data['image'];
    $removeImage = ($_POST['remove_image'] ?? '') === '1';

    $pdo->beginTransaction();

    try {
        $sql = 'UPDATE recipes SET
                    title = :title,
                    description = :description,
                    calorie_value = :calorie_value,
                    calorie_unit = :calorie_unit,
                    updated_at = datetime(\'now\')';

        if ($newImage !== null) {
            $sql .= ', image_blob = :image, thumbnail_blob = :thumbnail, image_type = :image_type';
        } elseif ($removeImage) {
            $sql .= ', image_blob = NULL, thumbnail_blob = NULL, image_type = NULL';
        }

        $sql .= ' WHERE id = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':title', $data['title']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->bindValue(':calorie_value', $data['calorie_value']);
        $stmt->bindValue(':calorie_unit', $data['calorie_unit']);
        $stmt->bindValue(':id', $recipe['id']);

        if ($newImage !== null) {
            $stmt->bindValue(':image', $newImage['image'], PDO::PARAM_LOB);
            $stmt->bindValue(':thumbnail', $newImage['thumbnail'], PDO::PARAM_LOB);
            $stmt->bindValue(':image_type', $newImage['type']);
        }

        $stmt->execute();

        $pdo->prepare('DELETE FROM ingredients WHERE recipe_id = :id')->execute(['id' => $recipe['id']]);
        $pdo->prepare('DELETE FROM steps WHERE recipe_id = :id')->execute(['id' => $recipe['id']]);

        insert_ingredients($pdo, $recipe['id'], $data['ingredients']);
        insert_steps($pdo, $recipe['id'], $data['steps']);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log((string) $e);
        json_error('A recept mentése közben hiba történt.', 500);
    }

    json_response(['recipe' => ['id' => $recipe['id']]]);
}

function recipe_delete(string $id): never
{
    require_admin();

    $pdo = db();
    $stmt = $pdo->prepare('DELETE FROM recipes WHERE id = :id');
    $stmt->execute(['id' => (int) $id]);

    if ($stmt->rowCount() === 0) {
        json_error('A recept nem található.', 404);
    }

    json_response(['status' => 'ok']);
}

function recipe_image(string $id): never
{
    serve_recipe_blob((int) $id, 'image_blob');
}

function recipe_thumbnail(string $id): never
{
    serve_recipe_blob((int) $id, 'thumbnail_blob');
}

function find_recipe(int $id): ?array
{
    $stmt = db()->prepare(
        'SELECT id, title, description,
                CASE WHEN image_blob IS NOT NULL THEN 1 ELSE 0 END AS has_image,
                calorie_value, calorie_unit, created_by, created_at, updated_at
         FROM recipes WHERE id = :id'
    );
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if ($row === false) {
        return null;
    }

    set_image_urls($row);
    $row['has_image'] = (bool) $row['has_image'];
    $row['calorie_value'] = $row['calorie_value'] === null ? null : (float) $row['calorie_value'];

    return $row;
}

function set_image_urls(array &$row): void
{
    if ((int) $row['has_image'] === 1) {
        $row['imageUrl'] = '/api/recipes/' . $row['id'] . '/image';
        $row['thumbnailUrl'] = '/api/recipes/' . $row['id'] . '/thumbnail';
    } else {
        $row['imageUrl'] = null;
        $row['thumbnailUrl'] = null;
    }
}

function read_recipe_input(): array
{
    $title = trim((string) ($_POST['title'] ?? ''));

    if ($title === '') {
        json_error('A recept címe kötelező!', 400);
    }

    $description = trim((string) ($_POST['description'] ?? ''));
    $calorieValue = ($_POST['calorie_value'] ?? '') === '' ? null : (float) $_POST['calorie_value'];
    $calorieUnit = trim((string) ($_POST['calorie_unit'] ?? ''));

    if ($calorieUnit !== '' && !in_array($calorieUnit, CALORIE_UNITS, true)) {
        json_error('Érvénytelen kalória mértékegység.', 400);
    }

    return [
        'title' => $title,
        'description' => $description !== '' ? $description : null,
        'calorie_value' => $calorieValue,
        'calorie_unit' => $calorieUnit !== '' ? $calorieUnit : null,
        'image' => process_image_upload(),
        'ingredients' => read_ingredients($_POST['ingredients'] ?? '[]'),
        'steps' => read_steps($_POST['steps'] ?? '[]'),
    ];
}

function read_ingredients(string $json): array
{
    $decoded = json_decode($json, true);

    if (!is_array($decoded)) {
        json_error('Érvénytelen hozzávalók adat.', 400);
    }

    $result = [];

    foreach ($decoded as $i => $item) {
        $name = trim((string) ($item['name'] ?? ''));

        if ($name === '') {
            continue;
        }

        $result[] = [
            'quantity' => trim((string) ($item['quantity'] ?? '')),
            'name' => $name,
            'sort_order' => $i,
        ];
    }

    return $result;
}

function read_steps(string $json): array
{
    $decoded = json_decode($json, true);

    if (!is_array($decoded)) {
        json_error('Érvénytelen elkészítési adat.', 400);
    }

    $result = [];

    foreach ($decoded as $i => $item) {
        $instruction = trim((string) ($item['instruction'] ?? ''));

        if ($instruction === '') {
            continue;
        }

        $result[] = [
            'instruction' => $instruction,
            'step_number' => $i + 1,
        ];
    }

    return $result;
}

function insert_ingredients(PDO $pdo, int $recipeId, array $ingredients): void
{
    $stmt = $pdo->prepare('INSERT INTO ingredients (recipe_id, quantity, name, sort_order) VALUES (:recipe_id, :quantity, :name, :sort_order)');

    foreach ($ingredients as $ingredient) {
        $stmt->execute([
            'recipe_id' => $recipeId,
            'quantity' => $ingredient['quantity'],
            'name' => $ingredient['name'],
            'sort_order' => $ingredient['sort_order'],
        ]);
    }
}

function insert_steps(PDO $pdo, int $recipeId, array $steps): void
{
    $stmt = $pdo->prepare('INSERT INTO steps (recipe_id, step_number, instruction) VALUES (:recipe_id, :step_number, :instruction)');

    foreach ($steps as $step) {
        $stmt->execute([
            'recipe_id' => $recipeId,
            'step_number' => $step['step_number'],
            'instruction' => $step['instruction'],
        ]);
    }
}

function bind_recipe(PDOStatement $stmt, array $data, ?int $userId = null): void
{
    $image = $data['image'];
    $hasImage = $image !== null;

    $stmt->bindValue(':title', $data['title']);
    $stmt->bindValue(':description', $data['description']);
    $stmt->bindValue(':calorie_value', $data['calorie_value']);
    $stmt->bindValue(':calorie_unit', $data['calorie_unit']);

    if ($userId !== null) {
        $stmt->bindValue(':created_by', $userId);
    }

    if ($hasImage) {
        $stmt->bindValue(':image', $image['image'], PDO::PARAM_LOB);
        $stmt->bindValue(':thumbnail', $image['thumbnail'], PDO::PARAM_LOB);
        $stmt->bindValue(':image_type', $image['type']);
    } else {
        $stmt->bindValue(':image', null, PDO::PARAM_NULL);
        $stmt->bindValue(':thumbnail', null, PDO::PARAM_NULL);
        $stmt->bindValue(':image_type', null, PDO::PARAM_NULL);
    }
}

function serve_recipe_blob(int $id, string $column): never
{
    $stmt = db()->prepare("SELECT image_type, $column FROM recipes WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    if ($row === false || $row[$column] === null) {
        json_error('A kép nem található.', 404);
    }

    if ($column === 'thumbnail_blob') {
        $type = 'image/jpeg';
    } else {
        $type = $row['image_type'];
    }

    http_response_code(200);
    header('Content-Type: ' . $type);
    header('Cache-Control: public, max-age=31536000, immutable');
    echo $row[$column];
    exit;
}
