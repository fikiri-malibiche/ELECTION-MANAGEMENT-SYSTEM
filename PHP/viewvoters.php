<?php
require 'DBConnection.php';

try {
    $sql = 'SELECT voterID, full_name, sex, phone_number, email, user_password FROM voter';
    $stmt = $conn->query($sql);
    $voters = $stmt->fetchAll();
} catch (PDOException $e) {
    $error = 'Database error: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>View Voters</title>
    <link rel="stylesheet" href="../CSS/admin.css" />
    <style>
        .voter-table {
            max-width: 1100px;
            margin: 40px auto;
            padding: 20px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        .voter-table h1 {
            margin-bottom: 20px;
            font-size: 28px;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
        }
        table th,
        table td {
            padding: 12px 14px;
            border: 1px solid #ddd;
            text-align: left;
            vertical-align: middle;
        }
        table th {
            background: #005fa8;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 18px;
            color: #005fa8;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        .error {
            color: #d32f2f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <main class="voter-table">
        <a class="back-link" href="../HTML/admin.html">← Back to Admin Dashboard</a>
        <h1>Voter List</h1>

        <?php if (!empty($error)): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php else: ?>
            <?php if (!empty($voters)): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Voter ID</th>
                            <th>Full Name</th>
                            <th>Sex</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Password Hash</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($voters as $voter): ?>
                            <tr>
                                <td><?= htmlspecialchars($voter['voterID']) ?></td>
                                <td><?= htmlspecialchars($voter['full_name']) ?></td>
                                <td><?= htmlspecialchars($voter['sex']) ?></td>
                                <td><?= htmlspecialchars($voter['phone_number']) ?></td>
                                <td><?= htmlspecialchars($voter['email']) ?></td>
                                <td><?= htmlspecialchars($voter['user_password']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <p>Note: passwords are stored as hashes and cannot be converted back to the original plain text value.</p>
            <?php else: ?>
                <p>No voters found in the database.</p>
            <?php endif; ?>
        <?php endif; ?>
    </main>
</body>
</html>
