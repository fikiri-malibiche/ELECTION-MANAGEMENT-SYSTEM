<?php
header('Content-Type: application/json');
require "DBConnection.php";

if($_SERVER['REQUEST_METHOD'] == 'POST'){
    // Get JSON data
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = isset($input['username']) ? trim($input['username']) : "";
    $password = isset($input['password']) ? $input['password'] : "";
    
    if($username == "" || $password == ""){
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Please fill in all the fields."
        ]);
    }else{
        $sql = "SELECT username,user_password FROM user WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($user && password_verify($password, $user['user_password'])){
            echo json_encode([
                "success" => true,
                "message" => "Login successful!",
                "redirect" => "/HTML/homepage.html"
            ]);
        }else{
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Invalid username or password."
            ]);
        }
    }
}else{
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Access denied"
    ]);
}
?>
