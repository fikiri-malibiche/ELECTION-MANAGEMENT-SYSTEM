<?php
// /PHP/get_results.php
// Hii inarudisha matokeo ya uchaguzi

session_start();
require_once 'connection.php';

header('Content-Type: application/json');

// Angalia kama user amelogin
if (!isset($_SESSION['is_logged_in']) || $_SESSION['is_logged_in'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit();
}

try {
    // Pata wagombea na idadi ya kura zao
    $stmt = $pdo->query("
        SELECT 
            c.id,
            c.full_name,
            c.party,
            c.photo_url,
            COUNT(v.id) as votes_count,
            (
                SELECT COUNT(*) FROM votes
            ) as total_votes
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id
        ORDER BY votes_count DESC
    ");
    
    $results = $stmt->fetchAll();
    $totalVotes = $results[0]['total_votes'] ?? 0;
    
    // Hesabu asilimia
    foreach ($results as &$candidate) {
        if ($totalVotes > 0) {
            $candidate['percentage'] = round(($candidate['votes_count'] / $totalVotes) * 100, 2);
        } else {
            $candidate['percentage'] = 0;
        }
        unset($candidate['total_votes']);
    }
    
    echo json_encode([
        'success' => true,
        'total_votes' => $totalVotes,
        'results' => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>