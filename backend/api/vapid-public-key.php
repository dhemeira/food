<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';

header('Content-Type: application/json');

echo json_encode([
    'publicKey' => config()['vapid']['publicKey'],
]);
