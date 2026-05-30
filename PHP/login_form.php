<?php
require "DBConnection.php";
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $username = isset($_POST['username']) ? trim($_POST['username']) : "";
    $password = isset($_POST['password']) ? $_POST['password'] : "";
    if($username == "" || $password == ""){
        echo "Please fill in all the fields.";
    }else{
        $sql = "SELECT username,user_password FROM user WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if($user && password_verify($password, $user['user_password'])){
            echo "Login successful.";
        }else{
            echo "Invalid username or password.";
        }        
    }
}else{
    die("ACCESS DENIED");
}
