<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        if (!is_dir(DATA_DIR)) {
            mkdir(DATA_DIR, 0775, true);
        }

        $pdo = new PDO('sqlite:' . DATA_DIR . '/recipes.db');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA journal_mode = WAL');

        migrate($pdo);
    }

    return $pdo;
}

function migrate(PDO $pdo): void
{
    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role          TEXT NOT NULL CHECK (role IN ('admin', 'family')),
            created_at    TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS recipes (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            title          TEXT NOT NULL,
            description    TEXT,
            image_blob     BLOB,
            thumbnail_blob BLOB,
            image_type     TEXT,
            calorie_value  REAL,
            calorie_unit   TEXT CHECK (calorie_unit IN ('kcal/100g', 'kcal/adag', 'kcal/db')),
            created_by     INTEGER REFERENCES users(id),
            created_at     TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS ingredients (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
            quantity   TEXT NOT NULL DEFAULT '',
            name       TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS steps (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id   INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
            step_number INTEGER NOT NULL,
            instruction TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ingredients_recipe ON ingredients(recipe_id);
        CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps(recipe_id);

        CREATE TABLE IF NOT EXISTS menus (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT NOT NULL,
            created_by  INTEGER REFERENCES users(id),
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS menu_items (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            menu_id    INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
            recipe_id  INTEGER NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
            quantity   REAL NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON menu_items(menu_id);
        SQL);
}
