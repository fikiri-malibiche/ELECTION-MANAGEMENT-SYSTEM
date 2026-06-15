<?php
require 'DBConnection.php';

try {
    $sql = 'SELECT cd.candidateID, cd.candidate_name, p.party_name FROM candidate cd JOIN political_party p ON cd.partyID = p.partyID';
    $stmt = $conn->query($sql);
    $candidates = $stmt->fetchAll();
} catch (PDOException $e) {
    $error = 'Database error: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>View Candidates</title>
    <link rel="stylesheet" href="../CSS/admin.css" />
    <style>
        .candidate-table {
            max-width: 1000px;
            margin: 40px auto;
            padding: 20px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        .candidate-table h1 {
            margin-bottom: 20px;
            font-size: 28px;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            border-radius: 15px;
        }
        table th,
        table td {
            padding: 14px 16px;
            border: 1px solid #ddd;
            text-align: left;
        }
        table th {
            background: #0077cc;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }
        .error {
            color: #cc0000;
            font-weight: bold;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 18px;
            color: #0077cc;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <main class="candidate-table">
        <a class="back-link" href="../HTML/admin.html">← Back to Admin Dashboard</a>
        <h1>Candidate List</h1>

        <?php if (!empty($error)): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php else: ?>
            <?php if (!empty($candidates)): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Candidate ID</th>
                            <th>Candidate Name</th>
                            <th>Political Party</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($candidates as $candidate): ?>
                            <tr>
                                <td><?= htmlspecialchars($candidate['candidateID']) ?></td>
                                <td><?= htmlspecialchars($candidate['candidate_name']) ?></td>
                                <td><?= htmlspecialchars($candidate['party_name']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>No candidates found in the database.</p>
            <?php endif; ?>
        <?php endif; ?>
    </main>
</body>
</html>
