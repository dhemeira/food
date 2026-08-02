<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$data = json_decode((string) file_get_contents('php://input'), true);

if (!is_array($data) || !isset($data['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'endpoint required']);
    exit;
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
    static fn ($s): bool => ($s['endpoint'] ?? null) !== $data['endpoint']
));

$tmp = $file . '.tmp';
file_put_contents($tmp, json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
rename($tmp, $file);

echo json_encode(['status' => 'removed', 'total' => count($subscriptions)]);