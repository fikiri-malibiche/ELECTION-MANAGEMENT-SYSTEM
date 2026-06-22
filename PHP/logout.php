<?php
// /PHP/logout.php
session_start();

// =============================================
// REKODI ACTIVITY LOG (Kama imewezekana)
// =============================================

if (isset($_SESSION['user_id']) && isset($_SESSION['user_name'])) {
    try {
        require_once 'connection.php';
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $userName = $_SESSION['user_name'] ?? 'Unknown';
        
        $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
                               VALUES (?, CONCAT('logout - ', ?), ?, ?)");
        $stmt->execute([$_SESSION['user_id'], $userName, $ip, $userAgent]);
    } catch (Exception $e) {
        // Ignore logging errors - usizuie logout
    }
}

// =============================================
// FUTA SESSION YOTE
// =============================================

// 1. Futa variables zote za session
// Capture role before clearing session so we can redirect appropriately
$roleBefore = $_SESSION['user_role'] ?? null;
$_SESSION = array();

// 2. Futa cookie ya session
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(), 
        '', 
        time() - 42000,
        $params["path"], 
        $params["domain"],
        $params["secure"], 
        $params["httponly"]
    );
}

// 3. Destroy session
session_destroy();

// =============================================
// ELEKEZWA KWENYE LOGIN PAGE
// =============================================

// Redirect based on previous role: admins to admin login, others to public login
$redirect = '../HTML/login.html';
if ($roleBefore === 'admin') {
    $redirect = '../HTML/adminlogin.html';
}
header('Location: ' . $redirect);
exit();
?>