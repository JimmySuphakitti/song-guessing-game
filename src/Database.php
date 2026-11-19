<?php
namespace App;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dbDir = __DIR__ . '/../database';
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0777, true);
            }

            $dbPath = $dbDir . '/game.sqlite';
            $isNew = !file_exists($dbPath);

            try {
                self::$instance = new PDO("sqlite:" . $dbPath);
                self::$instance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$instance->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                // Enable foreign keys and UTF-8 pragma
                self::$instance->exec("PRAGMA foreign_keys = ON;");

                // Initialize tables and seed if database was newly created
                if ($isNew) {
                    $schemaPath = $dbDir . '/schema.sql';
                    if (file_exists($schemaPath)) {
                        $sql = file_get_contents($schemaPath);
                        self::$instance->exec($sql);
                    }
                }
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'error' => 'Database connection failed: ' . $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        return self::$instance;
    }
}
