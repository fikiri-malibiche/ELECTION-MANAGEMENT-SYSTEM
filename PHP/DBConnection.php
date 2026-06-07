<?php
//database connection
$host = "localhost";
$username = "root";
$password = "";
$dbname = "Election_ms";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];
    try{
        $conn = new PDO("mysql:host=$host;dbname=$dbname",$username,$password,$options);
    }catch(PDOException $e){
    die("Connection failed: ".$e->getMessage());
    }
?>