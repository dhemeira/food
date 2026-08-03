<?php

declare(strict_types=1);

require_once __DIR__ . '/response.php';

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $isHttps = (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name('recipes_session');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) (30 * 24 * 3600));
    session_set_cookie_params([
        'lifetime' => 30 * 24 * 3600,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function current_user(): ?array
{
    start_session();
    $user = $_SESSION['user'] ?? null;

    return is_array($user) ? $user : null;
}

function require_auth(): array
{
    $user = current_user();

    if ($user === null) {
        json_error('Bejelentkezés szükséges!', 401);
    }

    return $user;
}

function require_admin(): array
{
    $user = require_auth();

    if ($user['role'] !== 'admin') {
        json_error('Ehhez admin jogosultság kell!', 403);
    }

    return $user;
}
