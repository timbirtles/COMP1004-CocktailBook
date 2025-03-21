<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON input
    $jsonInput = file_get_contents("php://input");
    $requestData = json_decode($jsonInput, true);

    function manageRecipe($action, $id, $name, $description, $ingredients, $method, $image_name, $owner) {
        $filePath = 'recipes.json';

        // Cast id and action to int
        // default is string
        $id = (int) $id;
        $action = (int) $action;

        // Ensure ingredients and method are arrays
        if (!is_array($ingredients)) $ingredients = [];
        if (!is_array($method)) $method = [];

        // Collection of incoming data
        $data = [
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'ingredients' => $ingredients,
            'method' => $method,
            'image_name' => $image_name,
            'owner' => $owner
        ];

        // Read existing data
        $existingData = [];
        if (file_exists($filePath)) {
            $jsonContent = file_get_contents($filePath);
            $existingData = json_decode($jsonContent, true) ?? [];
        }

        $recipeFound = false;

        // Update recipe
        if ($action == 1) { 
            foreach ($existingData as &$recipe) {
                if ($recipe['id'] === $id) {
                    $recipe = $data;  // Update the recipe
                    $recipeFound = true;
                    break;
                }
            }
            unset($recipe); // Unset reference
        } 
        // Delete recipe
        elseif ($action == 2) { 
            // Filter out recipes that don't match the ID
            $filteredData = array_filter($existingData, function ($recipe) use ($id) {
                return $recipe['id'] !== $id;
            });

            // Check the recipe was found and deleted
            if (count($filteredData) < count($existingData)) {
                $recipeFound = true;
                
                // Ddecrement following IDs so that all IDs increment sequentally
                $existingData = array_values($filteredData);
                foreach ($existingData as $index => &$recipe) {
                    $recipe['id'] = $index + 1;
                }
            }
        }
        // Create new recipe
        elseif ($action == 0 || !$recipeFound) { 
            // Append data to existingData
            $existingData[] = $data;
        }
        // Save updated data
        file_put_contents($filePath, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return json_encode(["success" => true, "updated" => $recipeFound]);
    }

    echo manageRecipe(
        $requestData['action'] ?? null,
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