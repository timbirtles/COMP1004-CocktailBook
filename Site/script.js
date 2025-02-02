$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 1) {
        console.log("scroll");
        loadRecipes(calculateTotalRecipeCards());
    }
});

// Runs once page content has loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log($(window).width());
    // Loads one recipe then calculates how many are needed to fill the viewport
    // and loads the rest
    loadInitialRecipes();
    // Populate the search filters based on ingredients in the JSON.
    populateSearchFilters();
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


// ====================================================================
//                          VIEW RECIPES  
// ====================================================================

function calculateRecipeRowsNeeded() {
    if (document.getElementById('recipeCard')) {
        // Height of document visible on screen
        var documentHeight = document.getElementById('recipeCard').clientHeight;
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
            const divElement = createRecipeElement(recipe);
            // Set onclick listener
            divElement.onclick = (event) => ViewRecipe(event, recipeID);
            // Add element to document
            document.getElementById("recipeRow").appendChild(divElement);
            // Increment counter
            loadedRecipes++;
        }
    }
}

function ViewRecipe(event, id, close) {

    // True when close button is pressed
    if (close) {
        // Set display to 'none' to hide recipeView
        document.getElementById("recipeView").style.display = "none";
    }
    else {
        var recipes = loadFile("recipes.json");
        recipes = JSON.parse(recipes);

        // Delete data that may have previously populated the recipe viewer
        document.getElementById("recipeView_ingredient_list").innerHTML="";
        document.getElementById("recipeView_method_list").innerHTML="";

        var list = document.getElementById("recipeView_ingredient_list");
        recipes[id].ingredients.forEach((ingredient) => {
            var entry = document.createElement('li');
            entry.appendChild(document.createTextNode(ingredient));
            list.appendChild(entry);
        });

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

        document.getElementById("recipeView_button").style.display = "block";
    }
}

// Make login card visible
function displayLoginCard() {
    document.getElementById("loginCard").style.display = "block";
    // Hide other cards that clutter the layout
    document.getElementById("searchCard").style.display = "none";
    document.getElementById("recipeView").style.display = "none";
    document.getElementById("recipeRow").style.display = "none";
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


function populateSearchFilters() {
    var recipes = loadFile("recipes.json");
    // Parse as JSON content 
    recipes = JSON.parse(recipes);

    var ingredients = [];
    // Get number of recipes
    var total = Object.keys(recipes).length;
    // Start loading recipes from loadedRecipes value to loadedRecipes+count
    for (let i = 0; i < total-1; i++) {
        for (let x = 0; x < recipes[i].ingredients.length; x++) {
            let index = ingredients.indexOf(recipes[i].ingredients[x]);
            if (index == -1) {
                ingredients.push(recipes[i].ingredients[x]);
                const divElement = createSearchFilterElement(recipes[i].ingredients[x]);
                divElement.onclick = (event) => toggleSearchFilter(recipes[i].ingredients[x]);
                // Add element to document
                document.getElementById("searchForm").appendChild(divElement);
            }
            else {
                // Do nothing
            }
        }
    }

    console.log("Ingredients are " + ingredients);

}


// Returns true if the all the elements of array1 are present in array2
function canMakeRecipe(array1, array2) {
    return array1.every(item => array2.includes(item));
}

// Creates a dom element from a collection of objects
function createRecipeElement(recipe) {

    // Parent object
    const obj = {
        tagName: "DIV",
        id: "recipeCard" || null,
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


// 
function searchRecipes() {
    // Delete any error text from previous searches
    document.getElementById("searchErrorP").innerHTML="";

    // Check if any filters have been applied
    if (searchFilters.length === 0) {
        // Remove all recipe cards from list
        loadInitialRecipes();

    }
    else {

        var recipes = loadFile("recipes.json");
        // Parse as JSON content 
        recipes = JSON.parse(recipes);

        document.getElementById("recipeRow").innerHTML="";

        // Get number of recipes
        var total = Object.keys(recipes).length;
        console.log("filters are " + searchFilters);
        // Start loading recipes from loadedRecipes value to loadedRecipes+count
        var recipesFound = 0;
        for (let i = 0; i < total-1; i++) {
            if (canMakeRecipe(recipes[i].ingredients, searchFilters)) {
                recipesFound++;
                console.log("filters match: " + recipes[i].ingredients + " " + searchFilters)
                let recipeID = i;
                // Create new object with each element (img, title, description, ingredients)
                var recipe = recipes[i];
                const divElement = createRecipeElement(recipe);
                divElement.onclick = (event) => ViewRecipe(event, recipeID);
                // Add element to document
                document.getElementById("recipeRow").appendChild(divElement);
                
            }
        }  
        if (recipesFound == 0) {
            document.getElementById("searchErrorP").innerHTML="Could not find any recipes matching the criteria";
        }
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

var loggedInUser = "";

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