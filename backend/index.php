<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/routes/auth.php';

$routes = [
    'POST /auth/login' => 'auth_login',
    'POST /auth/logout' => 'auth_logout',
    'GET /auth/me' => 'auth_me',
];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = preg_replace('#^/api#', '', $uri) ?? $uri;
$path = '/' . trim($path, '/');

$key = $method . ' ' . $path;

if (!isset($routes[$key])) {
    json_error('Az endpoint nem található.', 404);
}

$routes[$key]();
