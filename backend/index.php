<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/recipes.php';
require_once __DIR__ . '/routes/admin.php';
require_once __DIR__ . '/routes/push.php';
require_once __DIR__ . '/routes/menus.php';

$routes = [
    'POST' => [
        '/^\/auth\/login$/' => 'auth_login',
        '/^\/auth\/logout$/' => 'auth_logout',
        '/^\/recipes$/' => 'recipe_create',
        '/^\/recipes\/(\d+)$/' => 'recipe_update',
        '/^\/push\/subscribe$/' => 'push_subscribe',
        '/^\/push\/unsubscribe$/' => 'push_unsubscribe',
        '/^\/menus$/' => 'menu_create',
        '/^\/menus\/(\d+)$/' => 'menu_update',
    ],
    'GET' => [
        '/^\/auth\/me$/' => 'auth_me',
        '/^\/recipes$/' => 'recipe_list',
        '/^\/recipes\/(\d+)$/' => 'recipe_get',
        '/^\/recipes\/(\d+)\/image$/' => 'recipe_image',
        '/^\/recipes\/(\d+)\/thumbnail$/' => 'recipe_thumbnail',
        '/^\/admin\/users$/' => 'admin_users',
        '/^\/push\/vapid-public-key$/' => 'push_vapid_public_key',
        '/^\/menus$/' => 'menu_list',
        '/^\/menus\/(\d+)$/' => 'menu_get',
    ],
    'PUT' => [
        '/^\/admin\/users\/(\d+)\/password$/' => 'admin_change_password',
    ],
    'DELETE' => [
        '/^\/recipes\/(\d+)$/' => 'recipe_delete',
        '/^\/menus\/(\d+)$/' => 'menu_delete',
    ],
];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$path = preg_replace('#^/api#', '', $uri) ?? $uri;
$path = '/' . trim($path, '/');

foreach (($routes[$method] ?? []) as $regex => $handler) {
    if (preg_match($regex, $path, $matches) === 1) {
        $handler(...array_slice($matches, 1));
        exit;
    }
}

json_error('Az endpoint nem található.', 404);
