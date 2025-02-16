<?php

// If request is POST type: 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON input
    $jsonInput = file_get_contents("php://input");
    $requestData = json_decode($jsonInput, true);

    function createRecipe($id, $name, $description, $ingredients, $method, $image_name, $owner) {
        $filePath = 'recipes.json';

        // Cast id to int
        $id = (int) $id;

        // Ensure ingredients and method are arrays
        if (!is_array($ingredients)) $ingredients = [];
        if (!is_array($method)) $method = [];

        $data = [
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'ingredients' => $ingredients,
            'method' => $method,
            'image_name' => $image_name,
            'owner' => $owner
        ];

        $existingData = [];
        if (file_exists($filePath)) {
            $jsonContent = file_get_contents($filePath);
            $existingData = json_decode($jsonContent, true) ?? [];
        }

        // Ensure existing recipes are retained
        $existingData[] = $data;
        file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        return json_encode(["success" => true]);
    }

    echo createRecipe(
        $requestData['id'] ?? null,
        $requestData['name'] ?? null,
        $requestData['description'] ?? null,
        $requestData['ingredients'] ?? [],
        $requestData['method'] ?? [],
        $requestData['image_name'] ?? null,
        $requestData['owner'] ?? null
    );
}

?>