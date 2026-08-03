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
$familyPassword = random_password();

$stmt = $pdo->prepare('INSERT INTO users (username, password_hash, role) VALUES (:username, :hash, :role)');
$stmt->execute([
    'username' => 'dhemeira',
    'hash' => password_hash($adminPassword, PASSWORD_BCRYPT),
    'role' => 'admin',
]);
$stmt->execute([
    'username' => 'csalad',
    'hash' => password_hash($familyPassword, PASSWORD_BCRYPT),
    'role' => 'family',
]);

echo "=== Felhasználók létrehozva ===\n";
echo "dhemeira jelszó: {$adminPassword}\n";
echo "csalad jelszó: {$familyPassword}\n";
echo "=== Őrizd meg ezeket a jelszavakat! ===" . PHP_EOL;
