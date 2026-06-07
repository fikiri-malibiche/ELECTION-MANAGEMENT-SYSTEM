<?php
require "DBConnection.php";
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $firstName = isset($_POST['first_name']) ? $_POST['first_name'] : "";
    $lastName = isset($_POST['last_name']) ? $_POST['last_name'] : "";
    $phoneNumber = isset($_POST['phone_number']) ? $_POST['phone_number'] : "";
    $email = isset($_POST['email']) ? $_POST['email'] : "";
    $password = isset($_POST['password']) ? $_POST['password'] : "";
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $sex = "";
    $full_name = $firstName." ".$lastName;
    if (isset($_POST['sex'])) {
        $sex = $_POST['sex'];
    }else {
        $sex = "";
    }
    if($firstName == "" || $lastName == "" || $phoneNumber == "" || $email == ""|| $password == "" || $sex == ""){
        echo "Please fill in all the fields.";
    }else{
        $sql = "INSERT INTO voter (full_name, sex, phone_number,email,user_password) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$full_name, $sex,$phoneNumber,$email,$hashed_password]);
        echo "<p>User registered successfully.</p>";
    }
}else{
    die("ACCESS DENIED");
}