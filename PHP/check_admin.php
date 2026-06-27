<?php
// /PHP/check_admin.php
// Hii script inaangalia kama admin yupo

require_once 'connection.php';

header('Content-Type: application/json');

// Angalia admin
$stmt = $pdo->prepare("SELECT id, email, role, status FROM users WHERE email = ? AND role = 'admin'");
$stmt->execute(['admin@election.com']);
$admin = $stmt->fetch();

if ($admin) {
    echo json_encode([
        'exists' => true,
        'admin' => $admin
    ]);
} else {
    echo json_encode([
        'exists' => false,
        'message' => 'Admin hapatikani. Tafadhali unda admin.'
    ]);
}
?>