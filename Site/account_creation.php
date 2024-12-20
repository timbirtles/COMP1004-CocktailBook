<?php

// If request is POST type: 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function createUser($username, $password) {
        // File path to json file
        $filePath = 'users.json';
        // data to write
        $data = ['username' => $username, 'password' => $password];

        // Check if users.json is populated with data
        $existingData = [];
        if (file_exists($filePath)) {
            $jsonContent = file_get_contents($filePath);
            $existingData  = json_decode($jsonContent, true) ?? [];
        }

        $existingData[] = $data;
        // Append new data to existing data
        file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT));
        return true;
    }

    // Create variables with request arguments
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;

    // Call createUser() with username and password. 'echo' ensures the function returns a result.
    echo createUser($username, $password);
}
?>
