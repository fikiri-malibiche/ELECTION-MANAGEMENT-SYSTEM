<?php
// /PHP/login.php - Toleo Rahisi Sana

// =============================================
// ZIMA ERRORS (Ili kuepuka HTML output)
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
// UNGA DATABASE (via connection.php)
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
// PATA DATA ZOTE
// =============================================

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// =============================================
// VALIDATION
// =============================================

$errors = [];

if (empty($email)) {
    $errors['email'] = 'Tafadhali ingiza barua pepe';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Barua pepe si sahihi';
}

if (empty($password)) {
    $errors['password'] = 'Tafadhali ingiza password';
}

// =============================================
// KAMA KUNA ERRORS, RUDISHA JSON
// =============================================

if (!empty($errors)) {
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit();
}

// =============================================
// TAFUTA USER KWENYE DATABASE
// =============================================

try {
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
    // CHECK ACCOUNT STATUS
    // Prevent login if account is pending or rejected
    // =============================================
    if (isset($user['status'])) {
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
                'error' => '❌ Akaunti yako imekataliwa. Tafadhali wasiliana na Admin.'
            ]);
            exit();
        }
    }

    // =============================================
    // ENFORCE PAGE-SPECIFIC ROLE (e.g., login.html should only accept voters)
    // If the client indicates this request came from the user login page, block admin/manager roles here
    // =============================================
    $origin = trim($_POST['origin'] ?? '');
    if ($origin === 'user' && isset($user['role']) && $user['role'] !== 'voter') {
        echo json_encode([
            'success' => false,
            'error' => 'Akaunti hii si ya wapiga kura. Tafadhali tumia ukurasa sahihi wa kuingia (admin au manager).'
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
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_phone'] = $user['phone'];
    $_SESSION['polling_station_id'] = $user['polling_station_id'];
    $_SESSION['is_logged_in'] = true;

    // =============================================
    // TENGENEZA REDIRECT URL
    // =============================================

    $redirect_url = '';

    switch($user['role']) {
        case 'admin':
            $redirect_url = '../HTML/admin_dashboard.html';
            break;
        case 'manager':
            $redirect_url = '../HTML/manager_dashboard.html';
            break;
        case 'voter':
        default:
            $redirect_url = '../HTML/voter_dashboard.html';
            break;
    }

    // =============================================
    // RUDISHA JSON SUCCESS
    // =============================================

    echo json_encode([
        'success' => true,
        'message' => '✅ Ingia imefanikiwa!',
        'redirect' => $redirect_url,
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
    exit();

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => '🚫 Kuna hitilafu kwenye mfumo. Tafadhali jaribu tena.'
    ]);
    exit();
}
?>