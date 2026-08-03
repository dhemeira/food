<?php

declare(strict_types=1);

require __DIR__ . '/../config.php';
require __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$auth = ['VAPID' => config()['vapid']];
$webPush = new WebPush($auth);

$file = DATA_DIR . '/subscriptions.json';
if (!is_file($file)) {
    fwrite(STDERR, "No subscriptions yet.\n");
    exit(1);
}

$subscriptions = json_decode((string) file_get_contents($file), true);
if (!is_array($subscriptions) || count($subscriptions) === 0) {
    fwrite(STDERR, "No subscriptions saved.\n");
    exit(1);
}

$payload = json_encode([
    'title' => 'Teszt recept',
    'body' => 'Ez egy teszt push üzenet.',
    'url' => '/',
    'sentAt' => gmdate('c'),
]);

foreach ($subscriptions as $sub) {
    $webPush->queueNotification(Subscription::create($sub), $payload);
}

$expired = [];
foreach ($webPush->flush() as $report) {
    if ($report->isSuccess()) {
        echo "Sent to {$report->getEndpoint()}\n";
        continue;
    }
    echo "Failed: {$report->getReason()} ({$report->getEndpoint()})\n";
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
    echo 'Removed ' . count($expired) . " expired subscription(s).\n";
}
