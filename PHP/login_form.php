<?php
header('Content-Type: application/json');
require "DBConnection.php";
session_start();

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $input = json_decode(file_get_contents('php://input'), true);
    $email = isset($input['email']) ? trim($input['email']) : "";
    $password = isset($input['password']) ? $input['password'] : "";

    if($email == "" || $password == ""){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Please fill in all the fields."
        ]);
        exit;
    }
    $sql = "SELECT userID, email, user_password FROM voter WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if($user && password_verify($password, $user['user_password'])){
        $_SESSION['userID'] = $user['userID'];
        echo json_encode([
            "success" => true,
            "message" => "Login successful!",
            "redirect" => "/HTML/homepage.html",
            "userID" => $user['userID']
        ]);
        exit;
    }else{
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password."
        ]);
        exit;
    }
}else{
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);
}
?>
