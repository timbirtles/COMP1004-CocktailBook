<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function greetUser($username, $password) {
        $filePath = 'users.json';

        $data = ['username' => $username, 'password' => $password];

        $existingData = [];
        if (file_exists($filePath)) {
            $jsonContent = file_get_contents($filePath);
            $existingData  = json_decode($jsonContent, true) ?? [];
        }

        $existingData[] = $data;

        file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT));
        return true;
    }

    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;

    echo greetUser($username, $password);
}
?>
