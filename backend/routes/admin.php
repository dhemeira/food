<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/response.php';

function admin_users(): never
{
    require_admin();

    $users = db()->query('SELECT id, username, role FROM users ORDER BY id')->fetchAll();

    json_response(['users' => $users]);
}

function admin_create_user(): never
{
    require_admin();

    $body = json_decode((string) file_get_contents('php://input'), true);
    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');
    $role = (string) ($body['role'] ?? 'family');

    if ($username === '') {
        json_error('A felhasználónév kötelező.', 400);
    }

    if (strlen($password) < 5) {
        json_error('A jelszónak legalább 5 karakter hosszúnak kell lennie.', 400);
    }

    if (!in_array($role, ['admin', 'family'], true)) {
        json_error('Érvénytelen szerepkör.', 400);
    }

    $pdo = db();

    try {
        $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, role) VALUES (:username, :hash, :role)');
        $stmt->execute([
            'username' => $username,
            'hash' => password_hash($password, PASSWORD_BCRYPT),
            'role' => $role,
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            json_error('Ez a felhasználónév már foglalt.', 409);
        }
        error_log((string) $e);
        json_error('A felhasználó létrehozása közben hiba történt.', 500);
    }

    $id = (int) $pdo->lastInsertId();

    json_response(['user' => ['id' => $id, 'username' => $username, 'role' => $role]], 201);
}

function admin_delete_user(string $userId): never
{
    $admin = require_admin();
    $id = (int) $userId;

    if ($id === $admin['id']) {
        json_error('Nem törölheted a saját fiókodat.', 400);
    }

    $pdo = db();

    $stmt = $pdo->prepare('SELECT role FROM users WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $target = $stmt->fetch();

    if ($target === false) {
        json_error('A felhasználó nem található.', 404);
    }

    if ($target['role'] === 'admin') {
        $adminCount = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'admin'")->fetchColumn();

        if ($adminCount <= 1) {
            json_error('Nem törölheted az utolsó adminisztrátort.', 400);
        }
    }

    $pdo->beginTransaction();

    try {
        $pdo->prepare('UPDATE recipes SET created_by = NULL WHERE created_by = :id')->execute(['id' => $id]);
        $pdo->prepare('UPDATE menus SET created_by = NULL WHERE created_by = :id')->execute(['id' => $id]);
        $pdo->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $id]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log((string) $e);
        json_error('A felhasználó törlése közben hiba történt.', 500);
    }

    json_response(['status' => 'ok']);
}

function admin_change_username(string $userId): never
{
    $admin = require_admin();
    $id = (int) $userId;

    $body = json_decode((string) file_get_contents('php://input'), true);
    $username = trim((string) ($body['username'] ?? ''));

    if ($username === '') {
        json_error('A felhasználónév kötelező.', 400);
    }

    $pdo = db();

    $stmt = $pdo->prepare('SELECT role FROM users WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $target = $stmt->fetch();

    if ($target === false) {
        json_error('A felhasználó nem található.', 404);
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username AND id != :id LIMIT 1');
    $stmt->execute(['username' => $username, 'id' => $id]);

    if ($stmt->fetch() !== false) {
        json_error('Ez a felhasználónév már foglalt.', 409);
    }

    $stmt = $pdo->prepare('UPDATE users SET username = :username WHERE id = :id');
    $stmt->execute(['username' => $username, 'id' => $id]);

    if ($id === $admin['id']) {
        $_SESSION['user']['username'] = $username;
    }

    json_response(['user' => ['id' => $id, 'username' => $username, 'role' => $target['role']]]);
}

function admin_change_password(string $userId): never
{
    require_admin();

    $body = json_decode((string) file_get_contents('php://input'), true);
    $password = (string) ($body['password'] ?? '');

    if (strlen($password) < 5) {
        json_error('A jelszónak legalább 5 karakter hosszúnak kell lennie.', 400);
    }

    $stmt = db()->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
    $stmt->execute([
        'hash' => password_hash($password, PASSWORD_BCRYPT),
        'id' => (int) $userId,
    ]);

    if ($stmt->rowCount() === 0) {
        json_error('A felhasználó nem található.', 404);
    }

    json_response(['status' => 'ok']);
}
