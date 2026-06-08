<?php
header('Content-Type: application/json');
require "DBConnection.php";
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $input = json_decode(file_get_contents('php://input'), true);
    $firstName = isset($input['first_name']) ? $input['first_name'] : "";
    $lastName = isset($input['last_name']) ? $input['last_name'] : "";
    $phoneNumber = isset($input['phone_number']) ? $input['phone_number'] : "";
    $email = isset($input['email']) ? $input['email'] : "";
    $password = isset($input['password']) ? $input['password'] : "";
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $sex = "";
    $full_name = $firstName." ".$lastName;
    if (isset($_POST['sex'])) {
        $sex = $_POST['sex'];
    }else {
        $sex = "";
    }
    if($firstName == "" || $lastName == "" || $phoneNumber == "" || $email == ""|| $password == "" || $sex == ""){
        http_response_code(403);
        echo json_encode(['error'=>'All fields are required']);
        exit;
    }else{
        $sql = "INSERT INTO voter (full_name, sex, phone_number,email,user_password) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$full_name, $sex,$phoneNumber,$email,$hashed_password]);
        http_response_code(200);
        echo json_encode(['message'=>'Account created']);
        exit;
    }
}else{
    http_response_code(500);
    echo json_encode(['error'=>'ACCESS DENIED']);
    exit;
}