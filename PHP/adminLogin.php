<?php
// /PHP/adminLogin.php

// =============================================
// ZIMA ERRORS ZOTE (Ili kuepuka HTML output)
// =============================================

error_reporting(0);
ini_set('display_errors', 0);

// =============================================
// SET HEADER KWA JSON
// =============================================

header('Content-Type: application/json');

// =============================================
// ANZA SESSION
// =============================================

session_start();

// Harden session cookies (best-effort; safe to run repeatedly)
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => $cookieParams['lifetime'] ?? 0,
    'path' => $cookieParams['path'] ?? '/',
    'domain' => $cookieParams['domain'] ?? '',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

// =============================================
// UNGA DATABASE
// =============================================

require_once 'connection.php';


// =============================================
// ANGAZIA KAMA FORM IMETUMWA
// =============================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit();
}

// =============================================
// PATA DATA
// =============================================

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// =============================================
// VALIDATION
// =============================================

if (empty($email)) {
    echo json_encode([
        'success' => false,
        'error' => 'Tafadhali ingiza barua pepe'
    ]);
    exit();
}

if (empty($password)) {
    echo json_encode([
        'success' => false,
        'error' => 'Tafadhali ingiza password'
    ]);
    exit();
}

// =============================================
// TAFUTA ADMIN KWENYE DATABASE
// =============================================

try {
    // Tafuta user kwa email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // =============================================
    // KAMA USER HAPO
    // =============================================

    if (!$user) {
        echo json_encode([
            'success' => false,
            'error' => 'Email au password si sahihi!'
        ]);
        exit();
    }

    // =============================================
    // ANGAZIA PASSWORD
    // =============================================

    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Email au password si sahihi!'
        ]);
        exit();
    }

    // =============================================
    // ANGAZIA ROLE - LAZIMA IWE ADMIN
    // =============================================

    if ($user['role'] !== 'admin') {
        echo json_encode([
            'success' => false,
            'error' => '❌ Huna ruhusa ya admin! Role yako ni: ' . $user['role']
        ]);
        exit();
    }

    // =============================================
    // ANGAZIA STATUS
    // =============================================

    if ($user['status'] === 'pending') {
        echo json_encode([
            'success' => false,
            'error' => '⏳ Akaunti yako inakaguliwa. Tafadhali subiri idhini.'
        ]);
        exit();
    }

    if ($user['status'] === 'rejected') {
        echo json_encode([
            'success' => false,
            'error' => '❌ Akaunti yako imekataliwa. Tafadhali wasiliana na Admin Mkuu.'
        ]);
        exit();
    }

    // =============================================
    // WEKA DATA KWENYE SESSION
    // =============================================

    // Prevent session fixation
    session_regenerate_id(true);

    $_SESSION['user_id'] = $user['id'];

    $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_first_name'] = $user['first_name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = 'admin';
    $_SESSION['user_phone'] = $user['phone'] ?? '';
    $_SESSION['polling_station_id'] = $user['polling_station_id'] ?? null;
    $_SESSION['is_logged_in'] = true;

    // =============================================
    // REKODI ACTIVITY LOG
    // =============================================

    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $logStmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
                                   VALUES (?, 'admin_login', ?, ?)");
        $logStmt->execute([$user['id'], $ip, $userAgent]);
    } catch (Exception $e) {
        // Ignore log error
    }

    // =============================================
    // RUDISHA JSON SUCCESS
    // =============================================

    echo json_encode([
        'success' => true,
        'message' => '✅ Ingia imefanikiwa!',
        'redirect' => '../HTML/admin_dashboard.html',
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'role' => 'admin'
        ]
    ]);
    exit();

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => '🚫 Kuna hitilafu kwenye mfumo. Tafadhali jaribu tena.'
    ]);
    exit();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => '🚫 Kuna hitilafu. Tafadhali jaribu tena.'
    ]);
    exit();
}
?>