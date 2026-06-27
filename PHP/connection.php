<?php
// /PHP/connection.php

// Session is started by each endpoint; keep this file focused on DB.

// =============================================
// DATA ZA UNGANISHO (use environment variables in production)
// =============================================

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'election_db';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';

// =============================================
// UNGANISHA DATABASE
// =============================================

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    // Don’t leak DB details to clients
    http_response_code(500);
    die('🚫 Connection failed');
}

// =============================================
// FUNCTIONS
// =============================================

function emailExists($email) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->rowCount() > 0;
}

function phoneExists($phone) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    return $stmt->rowCount() > 0;
}
?>
