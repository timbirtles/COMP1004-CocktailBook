$(window).scroll(function () {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 1) {
        console.log("scroll");
        loadRecipes(calculateTotalRecipeCards());
    }
});


document.addEventListener("DOMContentLoaded", function () {
    console.log($(window).width());
    loadRecipes(1);
    

    setTimeout(() => {
        loadRecipes(calculateTotalRecipeCards());
    }, 100);

    
});

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
var loadedRecipes = 0;

function loadRecipes(count) {
    // Load users.json into users
    var recipes = loadFile("recipes.json");
    // Parse as JSON content 
    recipes = JSON.parse(recipes);

    var total = loadedRecipes + count;
    // Start loading recipes from loadedRecipes value to loadedRecipes+count
    for (var i = loadedRecipes; i < total; i++) {
        // Check recipe exists
        if (recipes[i]) {
            // Create new object with each element (img, title, description, ingredients)
            var recipe = recipes[i];
            const obj = {
                tagName: "DIV",
                id: "recipeCard" || null,
                classList: ["recipe-column", "recipeCard"],
                children: []
            };
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
            // Add element to document
            document.getElementById("recipeRow").appendChild(divElement);
            // Increment counter
            loadedRecipes++;
        }
    }

    // Create DOM element from parent and children
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

}

function displayLoginCard() {
    document.getElementById("loginCard").style.display = "block";
}

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
    }
    // Otherwise alert the user something went wrong
    else {
        alert("Invalid username or password. Please try again");
    }
}


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