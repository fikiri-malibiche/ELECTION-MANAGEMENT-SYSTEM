<?php
require 'DBConnection.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query('SELECT COUNT(*) AS count FROM candidate');
    $row = $stmt->fetch();
    $count = $row ? (int) $row['count'] : 0;
    echo json_encode(['count' => $count]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
