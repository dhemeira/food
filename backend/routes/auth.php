<?php

declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/response.php';

function auth_login(): never
{
    $body = json_decode((string) file_get_contents('php://input'), true);
    $username = trim((string) ($body['username'] ?? ''));
    $password = (string) ($body['password'] ?? '');

    if ($username === '' || $password === '') {
        json_error('Add meg a felhasználónevet és a jelszót!', 400);
    }

    $stmt = db()->prepare(
        'SELECT id, username, password_hash, role FROM users WHERE username = :username LIMIT 1'
    );
    $stmt->execute(['username' => $username]);
    $row = $stmt->fetch();

    if ($row === false || !password_verify($password, $row['password_hash'])) {
        json_error('Hibás felhasználónév vagy jelszó!', 401);
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'role' => $row['role'],
    ];

    json_response(['user' => $_SESSION['user']]);
}

function auth_logout(): never
{
    start_session();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    session_destroy();
    json_response(['status' => 'ok']);
}

function auth_me(): never
{
    json_response(['user' => current_user()]);
}
