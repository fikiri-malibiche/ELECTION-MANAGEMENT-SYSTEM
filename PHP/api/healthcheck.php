<?php
header('Content-Type: application/json');
try {
    if (!isset($pdo)) {
        require_once '../connection.php';
    }
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'error' => 'db_not_ready']);
}

