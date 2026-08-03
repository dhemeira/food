<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/db.php';

function random_password(int $length = 12): string
{
    $chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $max = strlen($chars) - 1;
    $out = '';

    for ($i = 0; $i < $length; $i++) {
        $out .= $chars[random_int(0, $max)];
    }

    return $out;
}

$pdo = db();
$count = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

if ($count > 0) {
    echo "A felhasználók már léteznek, nincs tennivaló.\n";
    exit(0);
}

$adminPassword = random_password();

$stmt = $pdo->prepare('INSERT INTO users (username, password_hash, role) VALUES (:username, :hash, :role)');
$stmt->execute([
    'username' => 'dhemeira',
    'hash' => password_hash($adminPassword, PASSWORD_BCRYPT),
    'role' => 'admin',
]);

echo "=== Admin fiók létrehozva ===\n";
echo "dhemeira jelszó: {$adminPassword}\n";
echo "=== Őrizd meg ezt a jelszót! ===" . PHP_EOL;
echo "További fiókokat az admin felületen (/admin) hozhatsz létre." . PHP_EOL;
