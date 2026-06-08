<?php
header('Content-Type: application/json');
require "DBConnection.php";
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request payload']);
        exit;
    }

    $firstName = isset($input['first_name']) ? trim($input['first_name']) : "";
    $lastName = isset($input['last_name']) ? trim($input['last_name']) : "";
    $phoneNumber = isset($input['phone_number']) ? trim($input['phone_number']) : "";
    $email = isset($input['email']) ? trim($input['email']) : "";
    $password = isset($input['password']) ? $input['password'] : "";
    $sex = isset($input['sex']) ? trim($input['sex']) : "";
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $full_name = $firstName." ".$lastName;
    if($firstName == "" || $lastName == "" || $phoneNumber == "" || $email == "" || $password == "" || $sex == ""){
        http_response_code(403);
        echo json_encode(['error'=>'All fields are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid email address']);
        exit;
    }

    if (!preg_match('/^(male|female)$/i', $sex)) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid sex value']);
        exit;
    }

    $checkSql = "SELECT COUNT(*) FROM voter WHERE email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$email]);
    if ($checkStmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'This email is already registered']);
        exit;
    }

    $sql = "INSERT INTO voter (full_name, sex, phone_number,email,user_password) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$full_name, $sex, $phoneNumber, $email, $hashed_password]);
    http_response_code(201);
    echo json_encode(['message' => 'Account created']);
    exit;
}else{
    http_response_code(500);
    echo json_encode(['error'=>'ACCESS DENIED']);
    exit;
}