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

function admin_change_password(string $userId): never
{
    require_admin();

    $body = json_decode((string) file_get_contents('php://input'), true);
    $password = (string) ($body['password'] ?? '');

    if (strlen($password) < 8) {
        json_error('A jelszónak legalább 8 karakter hosszúnak kell lennie.', 400);
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
