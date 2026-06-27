<?php
// /PHP/get_stats.php
// File MOJA tu inayotoa data zote kwa dashboards zote

error_reporting(0);
ini_set('display_errors', 0);

session_start();

header('Content-Type: application/json');

try {
    require_once 'connection.php';
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// =============================================
// ANGAZIA KAMA USER AMELOGIN
// =============================================

if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Hujalogin']);
    exit();
}

// =============================================
// PATA ROLE NA STATION ID
// =============================================

$role = $_SESSION['user_role'] ?? 'voter';
$station_id = $_SESSION['polling_station_id'] ?? 0;

// =============================================
// DATA ZA MSINGI (Kwa Wote)
// =============================================

$data = [];

// 1. Wapiga kura wote (count approved or active voters)
$stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'voter' AND status IN ('approved','active')");
$data['total_voters'] = $stmt->fetchColumn();

// 2. Wagombea wote
$stmt = $pdo->query("SELECT COUNT(*) as total FROM candidates");
$data['total_candidates'] = $stmt->fetchColumn();

// 3. Kura zote
$stmt = $pdo->query("SELECT COUNT(*) as total FROM votes");
$data['total_votes'] = $stmt->fetchColumn();

// 4. Current winner for all dashboards
$stmt = $pdo->query(
    "SELECT c.id, c.full_name, c.party, COALESCE(COUNT(v.id), 0) AS votes_count
     FROM candidates c
     LEFT JOIN votes v ON c.id = v.candidate_id
     GROUP BY c.id
     ORDER BY votes_count DESC
     LIMIT 1"
);
$winner = $stmt->fetch();
if ($winner) {
    $winner['percentage'] = $data['total_votes'] > 0 ? round(($winner['votes_count'] / $data['total_votes']) * 100, 2) : 0;
}
$data['winner'] = $winner ?: null;

// 5. Wapiga kura pending (pending or blank status)
$stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'voter' AND status IN ('pending', '')");
$data['pending_voters'] = $stmt->fetchColumn();

// =============================================
// DATA ZA MANAGER (Kituo chake tu)
// =============================================

if ($role === 'manager' && $station_id > 0) {
    // Wapiga kura wa kituo chake (count only approved voters at the station)
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'voter' AND status = 'approved' AND polling_station_id = ?");
    $stmt->execute([$station_id]);
    $data['station_voters'] = $stmt->fetchColumn();
    
    // Kura za kituo chake
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM votes WHERE polling_station_id = ?");
    $stmt->execute([$station_id]);
    $data['station_votes'] = $stmt->fetchColumn();
}

// =============================================
// DATA ZA ADMIN (Matokeo ya wagombea)
// =============================================

if ($role === 'admin') {
    $stmt = $pdo->query("
        SELECT 
            c.id,
            c.full_name,
            c.party,
            COUNT(v.id) as votes_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id
        ORDER BY votes_count DESC
    ");
    $data['candidates'] = $stmt->fetchAll();
    
    // Hesabu asilimia
    $totalVotes = $data['total_votes'] > 0 ? $data['total_votes'] : 1;
    foreach ($data['candidates'] as &$c) {
        $c['percentage'] = round(($c['votes_count'] / $totalVotes) * 100, 2);
    }
}

// =============================================
// RUDISHA JSON
// =============================================

echo json_encode([
    'success' => true,
    'role' => $role,
    'data' => $data
]);
?>