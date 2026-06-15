<?php
require 'DBConnection.php';

try {
    $sql = "SELECT cd.candidateID,
                   cd.candidate_name,
                   COALESCE(p.party_name, '') AS party_name,
                   COUNT(vhv.voterID) AS vote_count
            FROM candidate cd
            LEFT JOIN candidate_has_vote vhv ON cd.candidateID = vhv.candidateID
            LEFT JOIN political_party p ON cd.partyID = p.partyID
            GROUP BY cd.candidateID, cd.candidate_name, p.party_name
            ORDER BY vote_count DESC, cd.candidate_name";

    $stmt = $conn->query($sql);
    $results = $stmt->fetchAll();
    $maxVotes = 0;
    foreach ($results as $row) {
        if ($row['vote_count'] > $maxVotes) {
            $maxVotes = $row['vote_count'];
        }
    }
    $winners = [];
    foreach ($results as $row) {
        if ($row['vote_count'] === $maxVotes && $maxVotes > 0) {
            $winners[] = $row['candidate_name'];
        }
    }
    if ($maxVotes > 0) {
        if (count($winners) === 1) {
            $winnerText = $winners[0];
        } else {
            $winnerText = implode(' and ', $winners);
        }
    } else {
        $winnerText = '';
    }
    foreach ($results as &$row) {
        if ($row['vote_count'] === $maxVotes && $maxVotes > 0) {
            $row['status'] = 'Leading';
        } elseif ($maxVotes === 0) {
            $row['status'] = 'No votes yet';
        } else {
            $row['status'] = 'Trailing';
        }
    }
    unset($row);
} catch (PDOException $e) {
    $error = 'Database error: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Election Results</title>
    <link rel="stylesheet" href="../CSS/admin.css" />
    <style>
        .results-table {
            max-width: 1000px;
            margin: 40px auto;
            padding: 20px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        .results-table h1 {
            margin-bottom: 20px;
            font-size: 28px;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 16px;
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
        .back-link {
            display: inline-block;
            margin-bottom: 18px;
            color: #0077cc;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .error {
            color: #cc0000;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <main class="results-table">
        <a class="back-link" href="../HTML/admin.html">← Back to Admin Dashboard</a>
        <h1>Election Results</h1>

        <?php if (!empty($error)): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php else: ?>
            <?php if (!empty($results)): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Candidate ID</th>
                            <th>Candidate Name</th>
                            <th>Political Party</th>
                            <th>Votes</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($results as $row): ?>
                            <tr>
                                <td><?= htmlspecialchars($row['candidateID']) ?></td>
                                <td><?= htmlspecialchars($row['candidate_name']) ?></td>
                                <td><?= htmlspecialchars($row['party_name']) ?></td>
                                <td><?= htmlspecialchars($row['vote_count']) ?></td>
                                <td><?= htmlspecialchars($row['status']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php if ($maxVotes > 0): ?>
                    <div class="election-report">
                        <p>According to this result, the winner is <?= htmlspecialchars($winnerText) ?>, hence <he>
                        <s></s> won the election.</p>
                    </div>
                <?php else: ?>
                    <div class="election-report">
                        <p>No votes have been cast yet, so there is no winner at this time.</p>
                    </div>
                <?php endif; ?>
            <?php else: ?>
                <p>No candidate vote results found.</p>
            <?php endif; ?>
        <?php endif; ?>
    </main>
</body>
</html>
