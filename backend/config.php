<?php

declare(strict_types=1);

function env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

const DATA_DIR = __DIR__ . '/data';

function config(): array
{
    return [
        'vapid' => [
            'subject' => env('VAPID_SUBJECT', 'mailto:contact@dhemeira.hu'),
            'publicKey' => env('VAPID_PUBLIC_KEY', ''),
            'privateKey' => env('VAPID_PRIVATE_KEY', ''),
        ],
    ];
}
