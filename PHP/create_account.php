<?php
require "DBConnection.php";
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $firstName = isset($_POST['first_name']) ? $_POST['first_name'] : "";
    $lastName = isset($_POST['last_name']) ? $_POST['last_name'] : "";
    $phoneNumber = isset($_POST['phone_number']) ? $_POST['phone_number'] : "";
    $email = isset($_POST['email']) ? $_POST['email'] : "";
    $username = isset($_POST['username']) ? $_POST['username'] : "";
    $password = isset($_POST['password']) ? $_POST['password'] : "";
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);
    $sex = "";
    if (isset($_POST['sex'])) {
        $sex = $_POST['sex'];
    }else {
        $sex = "";
    }
    if($firstName == "" || $lastName == "" || $phoneNumber == "" || $email == "" || $username == "" || $password == "" || $sex == ""){
        echo "Please fill in all the fields.";
    }else{
        $sql = "INSERT INTO user (first_name, last_name, phone_number, sex, email, username, user_password) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$firstName, $lastName, $phoneNumber, $sex, $email, $username, $hashed_password]);
        echo "<p>User registered successfully.</p>";
    }
}else{
    die("ACCESS DENIED");
}