<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

function push_notify(string $title, string $body, string $url = '/'): array
{
    $vapid = config()['vapid'];

    if ($vapid['publicKey'] === '' || $vapid['privateKey'] === '') {
        return ['sent' => 0, 'skipped' => 'no-vapid'];
    }

    require_once __DIR__ . '/../vendor/autoload.php';

    $file = DATA_DIR . '/subscriptions.json';

    if (!is_file($file)) {
        return ['sent' => 0, 'skipped' => 'no-subscriptions'];
    }

    $subscriptions = json_decode((string) file_get_contents($file), true);

    if (!is_array($subscriptions) || count($subscriptions) === 0) {
        return ['sent' => 0, 'skipped' => 'no-subscriptions'];
    }

    $webPush = new WebPush(['VAPID' => $vapid]);
    $payload = json_encode([
        'title' => $title,
        'body' => $body,
        'url' => $url,
        'sentAt' => gmdate('c'),
    ]);

    foreach ($subscriptions as $sub) {
        $webPush->queueNotification(Subscription::create($sub), $payload);
    }

    $sent = 0;
    $expired = [];

    foreach ($webPush->flush() as $report) {
        if ($report->isSuccess()) {
            $sent++;
            continue;
        }
        if ($report->isSubscriptionExpired()) {
            $expired[] = $report->getEndpoint();
        }
    }

    if (count($expired) > 0) {
        $subscriptions = array_values(array_filter(
            $subscriptions,
            static fn ($s): bool => !in_array($s['endpoint'] ?? null, $expired, true)
        ));
        $tmp = $file . '.tmp';
        file_put_contents($tmp, json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        rename($tmp, $file);
    }

    return ['sent' => $sent, 'removed' => count($expired)];
}
