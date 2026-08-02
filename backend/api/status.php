<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';

header('Content-Type: application/json');

echo json_encode([
    'ok' => true,
    'app' => 'recipe-app',
    'time' => date('c'),
]);
