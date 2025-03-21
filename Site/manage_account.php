<?php

// If request is POST type: 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    function modifyUser($username, $password) {
        // File path to JSON file
        $filePath = 'users.json';

        // Check if users.json is populated with data
        $existingData = [];
        if (file_exists($filePath)) {
            $jsonContent = file_get_contents($filePath);
            $existingData = json_decode($jsonContent, true) ?? [];
        }

        if ($password === null) {
            // Delete account with $username
            $existingData = array_filter($existingData, function ($user) use ($username) {
                return $user['username'] !== $username;
            });

            // Save the updated data back to the file
            file_put_contents($filePath, json_encode(array_values($existingData), JSON_PRETTY_PRINT));
            return json_encode(["success" => true]);
        } else {

            $existingData[] = ['username' => $username, 'password' => $password];
        
            // Save the updated data back to the file
            file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT));
            return $found ? "User '$username' updated." : "User '$username' created.";
        }
    }

    // Create variables with request arguments
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;

    // Call modifyUser() with username and password. 'echo' ensures the function returns a result.
    echo modifyUser($username, $password);
}

?>
