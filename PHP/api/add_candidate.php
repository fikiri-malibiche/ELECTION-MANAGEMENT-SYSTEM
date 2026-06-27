<?php
// /PHP/api/add_candidate.php
// API - Kuongeza mgombea

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
session_start();

// =============================================
// AUTHENTICATION CHECK
// =============================================

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Hujalogin']);
    exit();
}

if ($_SESSION['user_role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Huna ruhusa']);
    exit();
}

// =============================================
// UNGA DATABASE
// =============================================

try {
    require_once '../connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// =============================================
// GET DATA
// =============================================

$full_name = '';
$party = '';
$position = '';
$bio = '';
$csrf = $_POST['csrf_token'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name'] ?? '');
    $party = trim($_POST['party'] ?? '');
    $position = trim($_POST['position'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
}

// =============================================
// CSRF CHECK
// =============================================

if (empty($csrf) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $csrf)) {
    echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
    exit();
}

// =============================================
// VALIDATION
// =============================================

if (empty($full_name)) {
    echo json_encode(['success' => false, 'error' => 'Jina kamili linahitajika']);
    exit();
}

if (empty($party)) {
    echo json_encode(['success' => false, 'error' => 'Jina la chama linahitajika']);
    exit();
}

if (empty($position)) {
    echo json_encode(['success' => false, 'error' => 'Nafasi (position) inahitajika']);
    exit();
}

// =============================================
// SAVE CANDIDATE
// =============================================

try {
    $uploadBasePath = realpath(__DIR__ . '/../../IMAGES/candidates');
    if ($uploadBasePath === false) {
        $uploadBasePath = __DIR__ . '/../../IMAGES/candidates';
    }

    $partyLogoUrlValue = '';
    $photoUrlValue = '';

    if (empty($_FILES['party_logo_file']['name'])) {
        throw new Exception('Party logo upload is required.');
    }

    if (empty($_FILES['photo_file']['name'])) {
        throw new Exception('Candidate photo upload is required.');
    }

    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    $partyLogoFile = $_FILES['party_logo_file'];
    if ($partyLogoFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Party logo upload failed with error code: ' . $partyLogoFile['error']);
    }
    if (!in_array(mime_content_type($partyLogoFile['tmp_name']), $allowedMimeTypes, true)) {
        throw new Exception('Uploaded party logo must be a JPG, PNG, GIF, or WEBP image.');
    }

    $photoFile = $_FILES['photo_file'];
    if ($photoFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Photo upload failed with error code: ' . $photoFile['error']);
    }
    if (!in_array(mime_content_type($photoFile['tmp_name']), $allowedMimeTypes, true)) {
        throw new Exception('Uploaded photo must be a JPG, PNG, GIF, or WEBP image.');
    }

    if (!file_exists($uploadBasePath)) {
        mkdir($uploadBasePath, 0755, true);
    }

    $logoFilename = uniqid('logo_', true) . '_' . basename($partyLogoFile['name']);
    $logoTargetPath = $uploadBasePath . DIRECTORY_SEPARATOR . $logoFilename;
    if (!move_uploaded_file($partyLogoFile['tmp_name'], $logoTargetPath)) {
        throw new Exception('Unable to save uploaded party logo.');
    }
    $partyLogoUrlValue = '../IMAGES/candidates/' . $logoFilename;

    $photoFilename = uniqid('candidate_', true) . '_' . basename($photoFile['name']);
    $photoTargetPath = $uploadBasePath . DIRECTORY_SEPARATOR . $photoFilename;
    if (!move_uploaded_file($photoFile['tmp_name'], $photoTargetPath)) {
        throw new Exception('Unable to save uploaded photo.');
    }
    $photoUrlValue = '../IMAGES/candidates/' . $photoFilename;

    $sql = "INSERT INTO candidates (full_name, party, party_logo, position, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$full_name, $party, $partyLogoUrlValue, $position, $bio, $photoUrlValue]);

    echo json_encode([
        'success' => true,
        'message' => 'Mgombea ameongezwa kikamilifu!',
        'id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>

