<?php
session_start();
header('Content-Type: application/json');
$userID = $_SESSION['voterID'] ?? null;
echo json_encode(['voterID' => $userID]);
?>