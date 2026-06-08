<?php
session_start();
require 'DBConnection.php';
header('Content-Type: application/json');
$data = json_decode((file_get_contents("php://input")),true);
if($_SERVER['REQUEST_METHOD'] == 'POST'){
    $candidate_name =$data['candidate_name'];
    try{
        $candidateID = null;
        $sql = "SELECT candidateID FROM candidate WHERE candidate_name = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$candidate_name]);
        $candidate = $stmt->fetch(PDO::FETCH_ASSOC);
        if(!$candidate){
            http_response_code(404);
            echo json_encode(['error' => 'candidate is not found']);
            exit;
        }else{
            $candidateID = $candidate['candidateID'];
            $voterID = $_SESSION['voterID'];
            //check if candidate is already vote
            $checkvote = "SELECT candidateID,voterID FROM candidate_has_vote WHERE voterID = ?";
            $stmt = $conn->prepare($checkvote);
            $stmt->execute([$voterID]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if($result){
                http_response_code(403);
                echo json_encode(['error'=>'You have already vote']);
                exit;
            }else{
                $vote = "INSERT INTO candidate_has_vote(candidateID,voterID) values(?,?)";
                $stmt = $conn->prepare($vote);
                $stmt->execute([$candidateID,$voterID]);
                http_response_code(200);
                echo json_encode(['message'=>"vote recorded successfully"]);
                exit;
            }
        }
    }catch(Exception $e){
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['message'=>'Transaction failed '.$e->getMessage()]);
        exit;
    }
}else{
    http_response_code(404);
    echo json_encode(['error'=>'ACCESS DENIED']);
    exit;
}
?>