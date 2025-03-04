// Loads more recipes when the user scrolls near the bottom of the page
$(window).on('scroll', function() {
    // Get the scroll position
    var scrollPosition = $(window).scrollTop() + window.innerHeight;
    // Get height of page
    var documentHeight = $(document)[0].documentElement.scrollHeight;

    // Add a buffer to allow for discrepancies (required when testing on mobile)
    // Also creates a much more seamless scroll on desktop devices.
    var buffer = 100;

    // Check if user is near the bottom of the page
    if (scrollPosition + buffer >= documentHeight) 
        loadRecipes(calculateTotalRecipeCards());
});


// Runs once page content has loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log($(window).width());
    // Loads one recipe then calculates how many are needed to fill the viewport
    // and loads the rest
    loadInitialRecipes();
    // Populate the search filters and creation options based on ingredients in the JSON.
    populateFilters();
});

// Creates dom element from collection of objects
function createDomElement(obj) {
    // Create blank element
    const element = document.createElement(obj.tagName);

    // Set element id if obj has an id
    if (obj.id) {
        element.id = obj.id;
    }

    // Check .classList isn't null and is an array
    if (obj.classList && Array.isArray(obj.classList)) {
        // Add each element in array to class list
        element.classList.add(...obj.classList);
    }

    // Check .attributes isn't null
    if (obj.attributes) {
        // Add each attirubte to element
        Object.entries(obj.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    // Check and set type property if exists
    if (obj.type) {
        element.type = obj.type;
    }

    // Check and set value property if exists
    if (obj.value) {
        element.value = obj.value;
    }

    // Check .innerHTML isn't null and add to element
    if (obj.innerHTML) {
        element.innerHTML = obj.innerHTML;
    }

    // Create DOM element for each child and append to parent
    if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(childObj => {
            const childElement = createDomElement(childObj);
            element.appendChild(childElement); // Append the child element to the parent
        });
    }

    return element;
}

function loadHome() {
    location.reload();
}

// ====================================================================
//                          VIEW RECIPES  
// ====================================================================

function calculateRecipeRowsNeeded() {
    if (document.getElementById('recipeCard0')) {
        // Height of document visible on screen
        var documentHeight = document.getElementById('recipeCard0').clientHeight;
        // Height of navbar
        var navHeight = document.getElementById('navbar').clientHeight;
        // Height without navbar
        var height = $(window).height() - navHeight;
        // Number of rows needed, rounded up.
        var padding = 10;
        var count = Math.ceil(height/(documentHeight+padding));
        return count;
    }
}

function calculateTotalRecipeCards() {
    // Window height
    var height = $(window).height();
    // Window width
    var width = $(window).width();
    var hCount = 0; // Horizontal count

    // Determine hCount from css rules.
    if (width > 1400) hCount = 6;
    else if (width > 800 && width <= 1400) hCount = 4;
    else hCount = 2;

    // Determine total number of cards to load
    return (hCount * (calculateRecipeRowsNeeded()+1))-1;
}
// Counter for number of recipes loaded

function loadInitialRecipes() {
    loadedRecipes = 0;
    document.getElementById("recipeRow").innerHTML="";
    loadRecipes(1);
    setTimeout(() => {
        console.log("count is " + calculateTotalRecipeCards());
        loadRecipes(calculateTotalRecipeCards());
    }, 100);
}

var loadedRecipes = 0;

function loadRecipes(count) {
    // Load users.json into users
    var recipes = loadFile("recipes.json");
    // Parse as JSON content 
    recipes = JSON.parse(recipes);

    var total = loadedRecipes + count;
    // Start loading recipes from loadedRecipes value to loadedRecipes+count
    for (let i = loadedRecipes; i < total; i++) {     
        // Check recipe exists
        if (recipes[i]) {
            let recipeID = i;
            var recipe = recipes[i];
             // Create new object with each child element (img, title, description, ingredients)
            const divElement = createRecipeElement(recipe, recipeID);
            // Set onclick listener
            divElement.onclick = (event) => ViewRecipe(event, recipeID);
            // Add element to document
            document.getElementById("recipeRow").appendChild(divElement);
            // Increment counter
            loadedRecipes++;
        }
    }
}


// Load and display all details of a given recipe
function ViewRecipe(event, id, close) {

    // True when close button is pressed
    if (close) {
        // Set display to 'none' to hide recipeView
        document.getElementById("recipeView").style.display = "none";
    }
    else {
        document.getElementById("recipeCreator").style.display = "none";
        var recipes = loadFile("recipes.json");
        recipes = JSON.parse(recipes);
    

        // Delete data that may have previously populated the recipe viewer
        document.getElementById("recipeView_ingredient_list").innerHTML="";
        document.getElementById("recipeView_method_list").innerHTML="";

        // Populate ingredient list from JSON entry
        var list = document.getElementById("recipeView_ingredient_list");
        recipes[id].ingredients.forEach((ingredient) => {
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(ingredient));
            list.appendChild(entry);
        });
        // Populate method list from JSON entry
        var list = document.getElementById("recipeView_method_list");
        recipes[id].method.forEach((instruction) => {
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(instruction));
            list.appendChild(entry);
        });

        document.getElementById("recipeView_title").innerText = recipes[id].name;
        document.getElementById("recipeView_img").src = recipes[id].image_name;
        //document.getElementById("recipeView_ingredient_list").innerText = recipes[id].method;
        document.getElementById("recipeView").style.display = "block";

        document.getElementById("recipeView_button_close").style.display = "block";

        if (loggedInUsersUsername == recipes[id].owner) {
            let script = "javascript: LoadRecipeEditor(" + id + ");"
            document.getElementById("recipeView_button_edit").setAttribute( "onClick", script );
            document.getElementById("recipeView_button_edit").style.display = "block";
        }
        else {
            document.getElementById("recipeView_button_edit").style.display = "none";
        }

        document.getElementById("recipeView").scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
}

// Make login card visible
function displayLoginCard() {
    document.getElementById("loginCard").style.display = "block";
    // Hide other cards that clutter the layout
    document.getElementById("searchCard").style.display = "none";
    document.getElementById("recipeView").style.display = "none";
    document.getElementById("recipeRow").style.display = "none";
    document.getElementById("recipeCreator").style.display = "none";
}

// Make recipe creation card visible
function displayRecipeCreatorCard() {
    if (!loggedInUsersUsername) alert("You must be logged in to create a recipe!");
        else {
        document.getElementById("recipeCreator").style.display = "block";
        // Hide other cards that clutter the layout
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("searchCard").style.display = "none";
        document.getElementById("recipeView").style.display = "none";
        document.getElementById("recipeRow").style.display = "none";
    }
}

// ====================================================================
//                           RECIPE CREATION  
// ====================================================================

// Add a new ingredient to the selector if it does not exist already 
// (Only permenant on recipe creation)
function recipeCreator_AddNewIngredient() {

    // Get the value of the new ingredient
    var newIngredient = document.getElementById("recipeCreator-newIngredient").value;
    // Conduct input checks
    if (newIngredient == "") alert("Ingredient cannot be blank!")
    else if (newIngredient.length > 25) alert("Ingredient must be shorter than 25 characters!")
    else {
        // Create toggleable element from the value input
        const creationDivElement = createSearchFilterElement(newIngredient);
        creationDivElement.id = "recipeCreator-ingredient-" + newIngredient;
        creationDivElement.onclick = (event) => toggleIngredient(newIngredient);
        // Add the element to the list of ingredients
        document.getElementById("recipeCreator-ingredientSelect").appendChild(creationDivElement);

        // Toggle the ingredient on
        document.getElementById("recipeCreator-ingredient-" + newIngredient).classList.add("searchItemToggled");
        ingredientList.push(newIngredient);

        // Reset new ingredient input
        document.getElementById("recipeCreator-newIngredient").value = "";
    }
}

// Number of steps in method
var methodStepCount = 1;
// Adds a new method instruction to the recipe creator card
function recipeCreator_NewMethod() {

    // Get the input for step 1 and duplicate it
    var elemId = "recipeCreator-method";
    var elem = document.getElementById(elemId + methodStepCount); 
    var newElem = elem.cloneNode(true); 
    // Increment the step count
    methodStepCount++;
    // Set cloned elements id and value
    newElem.setAttribute('id', elemId + methodStepCount);
    newElem.value = "";
    
    // Create a p element containing the step number
    const p = document.createElement("p");
    const pVal = document.createTextNode("Step " + methodStepCount);
    // Append the p element
    p.appendChild(pVal);
    // Append the ingredient element
    var before = elem.nextSibling;
    // there's no insertAfter, only insertBefore, which is why we found the before
    elem.parentNode.insertBefore(p, before);
    elem.parentNode.insertBefore(newElem, before);

}

// List of all ingredients selected in the recipe creator
var ingredientList = [];

// Toggles adding required ingredient to new recipe
function toggleIngredient(item) {
    // Get index of item in searchFilters array
    let index = ingredientList.indexOf(item);
    // suffix for each search filter item id
    var idSuffix = "recipeCreator-ingredient-";

    let itemID = idSuffix + item;

    // If the item is not in the array:
    if (index == -1) {
        // Add the item
        ingredientList.push(item);
        // Update class list to change colours
        document.getElementById(itemID).classList.add("searchItemToggled");
    }
    // If the item is in the array
    else {
        // Remove the item
        ingredientList.splice(index, 1);
        // Update class list to change colours
        document.getElementById(itemID).classList.remove("searchItemToggled");
    }
    console.log(ingredientList);
}


// Checks user inputs and adds, updates or deletes a recipe
// depending on 'type' value.
async function manageRecipe(type, recipeID) {

    let ingredients = [];
    console.log(type);
    let rName = document.getElementById("recipeCreator-recipeName").value;
    let rDescription = document.getElementById("recipeCreator-recipeDescription").value;
    let rIngredients = ingredientList;
    let rOwner = loggedInUsersUsername;

    // Perform input checks before continuing
    if (rName == "" || rDescription == "") alert("Input fields cannot be blank!");
    if (rName.length > 50 || rDescription.length > 200) alert("Ensure your recipe name and description meet the length requirements!");
    else if (rIngredients.length == 0) alert("You must select some ingredients!");
    else if (methodStepCount == 1 && document.getElementById("recipeCreator-method1").value == "") alert("You must have at least one step in the method!");
    else {
        let rImage_name = "images/cocktails/cover-1.png";
        let rMethod = [];

        // Get the number of recipes in recipes.json to determine the id of the new one
        var recipes = loadFile("recipes.json");
        recipes = JSON.parse(recipes);

        var totalElements = Object.keys(recipes).length;
        for (let x = 1; x <= methodStepCount; x++) {
            let currentMethodStepValue = document.getElementById("recipeCreator-method" + x).value
            // Skip method step if it is empty. 
            if (currentMethodStepValue != "") rMethod.push(currentMethodStepValue);
        }
        let rId = recipeID ? recipeID : totalElements + 1;

        // Post the request to manage_recipe.php
        const response = await fetch('manage_recipe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: JSON.stringify({
                action: type,
                id: rId,
                name: rName,
                description: rDescription,
                ingredients: rIngredients,  // Properly formatted array
                method: rMethod,  // Properly formatted array
                image_name: rImage_name,
                owner: rOwner
            })
        });

        // Validate response
        if (!response.ok) {
            throw new Error("Response invalid");
        }

        // Should be reset regardless as the page is reloaded below, 
        // but variables are re-initialised here to ensure fresh start
        ingredientList = [];
        methodStepCount = 1;

        // Reload the page to force update
        if (type == 0) {
            alert("Recipe created!");
        }
        else if (type == 1) {
            alert("Recipe updated!");
        }
        else {
            alert("Recipe deleted.");
        }
        location.reload();
    }
    

}


// ====================================================================
//                           RECIPE EDITOR
// ====================================================================

// Utilises the recipe creator

function LoadRecipeEditor(id) {


    document.getElementById("recipeCreator").style.display = "block";
    document.getElementById("recipeView").style.display = "none";
    document.getElementById("recipeRow").style.display = "none";

    var recipes = loadFile("recipes.json");
    recipes = JSON.parse(recipes);
    let recipe = recipes[id];


    // List of all ingredients selected in the recipe creator
    ingredientList = [];
    var total = Object.keys(recipe.ingredients).length;
    // Increment over every recipe in recipes.json
    let ingredientIdSuffix = "recipeCreator-ingredient-";
    for (let i = 0; i < total; i++) {
        ingredientList.push(recipe.ingredients[i]);
        document.getElementById(ingredientIdSuffix + recipe.ingredients[i]).classList.add("searchItemToggled");
    }

    document.getElementById("recipeCreator-title").innerHTML = "Edit Recipe";
    document.getElementById("recipeCreator-recipeName").value = recipe.name;
    document.getElementById("recipeCreator-recipeDescription").value = recipe.description;
    document.getElementById("recipeCreator-recipeCreationButton").value = "Save";
    document.getElementById("recipeCreator-recipeDeleteButton").style.display = "unset";

    // Required to include arguments
    let script = "javascript: manageRecipe(1, " + recipe.id + ");"
    document.getElementById("recipeCreator-recipeCreationButton").setAttribute( "onClick", script );

    script = "javascript: manageRecipe(2, " + recipe.id + ");"
    document.getElementById("recipeCreator-recipeDeleteButton").setAttribute( "onClick", script );

    var list = document.getElementById("recipeView_method_list");
    methodStepCount = 0;
    var total = Object.keys(recipe.method).length;
    for (let i = 0; i < total; i++) {
        methodStepCount++;
        var elemId = "recipeCreator-method";

        if (methodStepCount == 1) {
            document.getElementById(elemId + methodStepCount).value = recipe.method[i];
        }
        else {
            var elem = document.getElementById(elemId + i); 
            console.log(elemId + methodStepCount);
            var newElem = elem.cloneNode(true); 
            // Increment the step count
            // Set cloned elements id and value
            newElem.setAttribute('id', elemId + methodStepCount);
            newElem.value = recipe.method[i];
            
            // Create a p element containing the step number
            const p = document.createElement("p");
            const pVal = document.createTextNode("Step " + methodStepCount);
            // Append the p element
            p.appendChild(pVal);
            // Append the ingredient element
            var before = elem.nextSibling;
            // there's no insertAfter, only insertBefore, which is why we found the before
            elem.parentNode.insertBefore(p, before);
            elem.parentNode.insertBefore(newElem, before);
        }

    }

    
}



// ====================================================================
//                              SEARCH  
// ====================================================================
// Make search card visible
function displaySearchCard() {
    document.getElementById("searchCard").style.display = "block";
    // Ensure recipe cards are visible
    document.getElementById("recipeRow").style.display = "flex";
    // Hide other cards that clutter the layout
    document.getElementById("loginCard").style.display = "none";
    document.getElementById("recipeView").style.display = "none";
    document.getElementById("recipeCreator").style.display = "none";
}

// Stores applied search filters
const searchFilters = [];


function createSearchFilterElement(filterObj) {

    var idSuffix = "_searchfilter";

    let itemID = filterObj + idSuffix;
    itemID = itemID.replace(/\s+/g, '-').toLowerCase();

    // Parent object
    const obj = {
        tagName: "INPUT",
        type: "button",
        id: itemID,
        classList: ["searchItem"],
        value: filterObj,
        onClick: null,
        children: []
    };
    
    // Create dom element
    const divElement = createDomElement(obj);

    return divElement;
    
}

function toggleSearchFilter(item) {
    // Get index of item in searchFilters array
    let index = searchFilters.indexOf(item);
    // suffix for each search filter item id
    var idSuffix = "_searchfilter";

    let itemID = item + idSuffix;
    itemID = itemID.replace(/\s+/g, '-').toLowerCase();

    // If the item is not in the array:
    if (index == -1) {
        // Add the item
        searchFilters.push(item);
        // Update class list to change colours
        document.getElementById(itemID).classList.add("searchItemToggled");
    }
    // If the item is in the array
    else {
        // Remove the item
        searchFilters.splice(index, 1);
        // Update class list to change colours
        document.getElementById(itemID).classList.remove("searchItemToggled");
    }
    console.log(searchFilters);
}


function populateFilters(item) {
    var recipes = loadFile("recipes.json");
    // Parse as JSON content 
    recipes = JSON.parse(recipes);

    var ingredients = [];
    // Get number of recipes
    var total = Object.keys(recipes).length;
    // Increment over every recipe in recipes.json
    for (let i = 0; i < total; i++) {
        // Increment over every ingredient in the recipe of index i
        for (let x = 0; x < recipes[i].ingredients.length; x++) {
            let index = ingredients.indexOf(recipes[i].ingredients[x]);
            if (index == -1) {
                ingredients.push(recipes[i].ingredients[x]);
                const divElement = createSearchFilterElement(recipes[i].ingredients[x]);
                divElement.onclick = (event) => toggleSearchFilter(recipes[i].ingredients[x]);
                // Add element to document
                document.getElementById("searchForm").appendChild(divElement);

                // Repeat for recipe creation card if justSearch is false
                const creationDivElement = createSearchFilterElement(recipes[i].ingredients[x]);
                creationDivElement.id = "recipeCreator-ingredient-" + recipes[i].ingredients[x];
                creationDivElement.onclick = (event) => toggleIngredient(recipes[i].ingredients[x]);
                document.getElementById("recipeCreator-ingredientSelect").appendChild(creationDivElement);
            }
        }
    }

    console.log("Ingredients are " + ingredients);

}


// Returns true if the all the elements of array1 are present in array2
function canMakeRecipe(array1, array2) {
    if (array2.length == 0) return true;
    else return array1.every(item => array2.includes(item));
}

// Creates a dom element from a collection of objects
function createRecipeElement(recipe, recipeID) {

    // Parent object
    const obj = {
        tagName: "DIV",
        id: "recipeCard" + recipeID || null,
        classList: ["recipe-column", "recipeCard"],
        onClick: null,
        children: []
    };
    // Child objects
    const imgChild = {
        tagName: "img",
        id: "childParagraph",
        attributes: {
            src: "images/cocktails/cover-1.png"
        }
    };
    obj.children.push(imgChild);
    const titleP = {
        tagName: "P",
        id: "title",
        innerHTML: recipe.name
    };
    obj.children.push(titleP);
    const descP = {
        tagName: "P",
        id: "description",
        innerHTML: recipe.description
    };
    obj.children.push(descP);
    // Separate each ingredient in array with a comma and whitespace
    const ingredientsString = recipe.ingredients.join(', ');
    const ingP = {
        tagName: "P",
        id: "ingredients",
        innerHTML: ingredientsString
    };
    obj.children.push(ingP);
    
    // Create dom element
    const divElement = createDomElement(obj);


    return divElement;
}


// Search through recipes based on user input and update displayed recipe cards
function searchRecipes() {
    // Delete any error text from previous searches
    document.getElementById("searchErrorP").innerHTML="";
    let searchField = document.getElementById("searchInput").value;
    searchField = searchField.toString().toLowerCase();
    

        //loadInitialRecipes();

        var recipes = loadFile("recipes.json");
        // Parse as JSON content 
        recipes = JSON.parse(recipes);

        // Clear displayed recipe cards
        document.getElementById("recipeRow").innerHTML="";

        // Get number of recipes
        var total = Object.keys(recipes).length;

        // iterate over recipes
        var recipesFound = 0;
        for (let i = 0; i < total-1; i++) {
            let recipeName = recipes[i].name.toString().toLowerCase();
            // Check if searchField is populated
            if (searchField != "") {
                // Check if recipe name contains searchField criteria
                if (recipeName.includes(searchField)) {
                    // Check if ingredients selected (if any) match those of the recipe
                    if (canMakeRecipe(recipes[i].ingredients, searchFilters)) {
                        recipesFound++;
                        // Add recipe as card
                        createSearchedRecipe(i);
                    }
                }
            }
            // No search field, just ingredients
            else {
                // Check if ingredients selected match those of the recipe 
                if (canMakeRecipe(recipes[i].ingredients, searchFilters)) {
                    recipesFound++;
                    // Add recipe as card
                    createSearchedRecipe(i);
                }
            }
        }  
        if (recipesFound == 0) {
            // Create error message if no recipes found.
            document.getElementById("searchErrorP").innerHTML="Could not find any recipes matching the criteria";
        }

    // Creates a recipe card from input information
    function createSearchedRecipe(i) {
        // Create new object with each element (img, title, description, ingredients)
        let recipe = recipes[i];
        let recipeID = recipe.id;
        const divElement = createRecipeElement(recipe);
        divElement.onclick = (event) => ViewRecipe(event, recipeID);
        // Add element to document
        document.getElementById("recipeRow").appendChild(divElement);
    }
}


// ====================================================================
//                    LOGIN / ACCOUNT CREATION
// ====================================================================
// Check if username exists in users.json
function UserExists(username) {
    try {
        // Load the file into users
        var users = loadFile("users.json");

        // Parse file as json content
        users = JSON.parse(users);
        // Check if username is in file
        return users.some(function (user) {
            return user.username === username;
        });

    }
    catch (error) {
        return false;
    }
}

// Create new user account
async function createUser() {
    // Get username and password values from login form
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        // Check the username is not already in use
        if (!UserExists(username)) {
            // Send POST request to account_creation.php to handle JSON file modification
            const response = await fetch('account_creation.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}` // Send username and password in the request body.
            });

            if (!response.ok) {
                throw new Error("Response invalid");
            }
            const result = await response.text();
            if (result) {
                loginUser();
            }

        }
    }
    catch (error) {
        console.error("There was a problem with fetch operation");
    }
}

var loggedInUsersUsername = "";

function loginUser() {

    // Get username and password values from login form
    var usernameInput = document.getElementById("loginUsername").value;
    var passwordInput = document.getElementById("loginPassword").value;

    // Load users.json into users
    var users = loadFile("users.json");
    // Parse as JSON content
    users = JSON.parse(users);

    // Check if user input matches values in users. (username, password)
    var user = users.find(function (user) {
        return user.username === usernameInput && user.password === passwordInput;
    });

    // If user exists, 'login' the user
    if (user) {
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("navbarLoginBtn").innerHTML = "Hello, " + user.username + "!";
        document.getElementById("recipeRow").style.display = "flex";
        loggedInUsersUsername = user.username;
        console.log(user + " " + loggedInUsersUsername);
    }
    // Otherwise alert the user something went wrong
    else {
        alert("Invalid username or password. Please try again");
    }
}

// ====================================================================
//                              JSON 
// ====================================================================

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    var cacheBuster = `?_=${new Date().getTime()}`;
    xmlhttp.open("GET", filePath + cacheBuster, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
        return result;
    }
    else {
        throw new Error("Failed to load file");
    }
}