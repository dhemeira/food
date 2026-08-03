<?php

declare(strict_types=1);

require __DIR__ . '/../lib/push.php';

$result = push_notify('A szerver elindult', 'A Receptek alkalmazás újra online!');

if (isset($result['skipped'])) {
    echo "No notification sent ({$result['skipped']}).\n";
    exit(0);
}

echo 'Sent to ' . $result['sent'] . " subscription(s).\n";

if (($result['removed'] ?? 0) > 0) {
    echo 'Removed ' . $result['removed'] . " expired subscription(s).\n";
}
