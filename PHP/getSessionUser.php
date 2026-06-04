<?php
session_start();
header('Content-Type: application/json');
$userID = $_SESSION['userID'] ?? null;
echo json_encode(['userID' => $userID]);
?>