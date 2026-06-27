<?php
// /PHP/register.php
session_start();
require_once 'connection.php';

// =============================================
// ANGAZIA KAMA FORM IMETUMWA
// =============================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../HTML/register.html');
    exit();
}

// =============================================
// PATA DATA ZOTE
// =============================================

$first_name = trim($_POST['first_name'] ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$sex = $_POST['sex'] ?? '';
$phone = trim($_POST['phone_number'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// =============================================
// VALIDATION
// =============================================

$errors = [];

// 1. First Name
if (empty($first_name)) {
    $errors['first_name'] = 'Tafadhali ingiza jina la kwanza';
}

// 2. Last Name
if (empty($last_name)) {
    $errors['last_name'] = 'Tafadhali ingiza jina la mwisho';
}

// 3. Sex
if (empty($sex)) {
    $errors['sex'] = 'Tafadhali chagua jinsia yako';
}

// 4. Phone
if (empty($phone)) {
    $errors['phone'] = 'Tafadhali ingiza namba ya simu';
} elseif (!preg_match('/^[0-9]{10,15}$/', $phone)) {
    $errors['phone'] = 'Namba ya simu si sahihi (namba 10-15)';
} elseif (phoneExists($phone)) {
    $errors['phone'] = 'Namba ya simu hii tayari imesajiliwa';
}

// 5. Email
if (empty($email)) {
    $errors['email'] = 'Tafadhali ingiza barua pepe';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Barua pepe si sahihi';
} elseif (emailExists($email)) {
    $errors['email'] = 'Barua pepe hii tayari imesajiliwa';
}

// 6. Password
if (empty($password)) {
    $errors['password'] = 'Tafadhali ingiza password';
} elseif (strlen($password) < 6) {
    $errors['password'] = 'Password lazima iwe angalau herufi 6';
}

// 7. Confirm Password
if ($password !== $confirm_password) {
    $errors['confirm'] = 'Password hazifanani';
}

// =============================================
// KAMA KUNA ERRORS, RUDISHA
// =============================================

if (!empty($errors)) {
    $_SESSION['register_errors'] = $errors;
    $_SESSION['old_data'] = $_POST;
    header('Location: ../HTML/register.html');
    exit();
}

// =============================================
// HAKUNA ERRORS - HIFADHI KWENYE DATABASE
// =============================================

try {
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // ===== MUHIMU: Role = 'voter', Status = 'pending' =====
    $sql = "INSERT INTO users (first_name, last_name, sex, role, status, phone, email, password) 
            VALUES (?, ?, ?, 'voter', 'pending', ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$first_name, $last_name, $sex, $phone, $email, $hashed_password]);

    // Fanikio
    $successMsg = "✅ Usajili wako umefanikiwa! Akaunti yako inakaguliwa na Admin. Utapata taarifa baada ya kuidhinishwa.";
    header('Location: ../HTML/register.html?success=' . urlencode($successMsg));
    exit();

} catch (PDOException $e) {
    // Hitilafu ya database
    $errorMsg = "🚫 Kuna hitilafu kwenye mfumo. Tafadhali jaribu tena baadaye.";
    header('Location: ../HTML/register.html?error=' . urlencode($errorMsg));
    exit();
}
?>