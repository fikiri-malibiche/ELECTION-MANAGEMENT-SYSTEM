<?php
// /PHP/create_admin.php

session_start();
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../HTML/create_admin.html');
    exit();
}

$first_name = trim($_POST['first_name'] ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

$errors = [];

if (empty($first_name)) {
    $errors[] = 'First name is required.';
}

if (empty($last_name)) {
    $errors[] = 'Last name is required.';
}

if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address.';
}

if (empty($phone)) {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[0-9]{7,15}$/', $phone)) {
    $errors[] = 'Phone number must contain only digits and be between 7 and 15 characters.';
}

if (empty($password)) {
    $errors[] = 'Password is required.';
} elseif (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters long.';
}

if ($password !== $confirm_password) {
    $errors[] = 'Passwords do not match.';
}

if (!empty($errors)) {
    $_SESSION['create_admin_errors'] = $errors;
    $_SESSION['create_admin_old'] = $_POST;
    header('Location: ../HTML/create_admin.html');
    exit();
}

try {
    // Verify email and phone uniqueness
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? OR phone = ?');
    $stmt->execute([$email, $phone]);
    if ($stmt->rowCount() > 0) {
        $_SESSION['create_admin_errors'] = ['Email or phone number already exists.'];
        $_SESSION['create_admin_old'] = $_POST;
        header('Location: ../HTML/create_admin.html');
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (first_name, last_name, sex, role, status, phone, email, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$first_name, $last_name, 'male', 'admin', 'approved', $phone, $email, $hashed_password]);

    $_SESSION['create_admin_success'] = 'Admin account created successfully.';
    header('Location: ../HTML/create_admin.html');
    exit();
} catch (PDOException $e) {
    $_SESSION['create_admin_errors'] = ['Database error: ' . $e->getMessage()];
    $_SESSION['create_admin_old'] = $_POST;
    header('Location: ../HTML/create_admin.html');
    exit();
}
?>