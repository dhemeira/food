<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/response.php';

function push_vapid_public_key(): never
{
    json_response(['publicKey' => config()['vapid']['publicKey']]);
}

function push_subscribe(): never
{
    $body = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($body) || !isset($body['endpoint'])) {
        json_error('Hibás feliratkozási adat.', 400);
    }

    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0775, true) && !is_dir(DATA_DIR)) {
        json_error('Nem sikerült a könyvtár létrehozása.', 500);
    }

    $file = DATA_DIR . '/subscriptions.json';
    $subscriptions = [];

    if (is_file($file)) {
        $existing = json_decode((string) file_get_contents($file), true);
        if (is_array($existing)) {
            $subscriptions = $existing;
        }
    }

    $subscriptions = array_values(array_filter(
        $subscriptions,
        static fn ($s): bool => ($s['endpoint'] ?? null) !== $body['endpoint']
    ));
    $subscriptions[] = $body;

    $tmp = $file . '.tmp';
    file_put_contents(
        $tmp,
        json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
    );
    rename($tmp, $file);

    json_response(['status' => 'saved', 'total' => count($subscriptions)]);
}

function push_unsubscribe(): never
{
    $body = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($body) || !isset($body['endpoint'])) {
        json_error('Hibás lemondási adat.', 400);
    }

    $file = DATA_DIR . '/subscriptions.json';
    $subscriptions = [];

    if (is_file($file)) {
        $existing = json_decode((string) file_get_contents($file), true);
        if (is_array($existing)) {
            $subscriptions = $existing;
        }
    }

    $subscriptions = array_values(array_filter(
        $subscriptions,
        static fn ($s): bool => ($s['endpoint'] ?? null) !== $body['endpoint']
    ));

    $tmp = $file . '.tmp';
    file_put_contents($tmp, json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    rename($tmp, $file);

    json_response(['status' => 'removed', 'total' => count($subscriptions)]);
}
