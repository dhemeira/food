<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!is_array($data) || !isset($data['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid subscription']);
    exit;
}

if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0775, true);
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
    fn($s) => ($s['endpoint'] ?? null) !== $data['endpoint']
));
$subscriptions[] = $data;

$tmp = $file . '.tmp';
file_put_contents(
    $tmp,
    json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
);
rename($tmp, $file);

echo json_encode([
    'status' => 'saved',
    'total' => count($subscriptions),
]);
