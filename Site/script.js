function displayLoginCard() {
    console.log("yes");
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
        return users.some(function(user) {
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
    var user = users.find(function(user) {
        return user.username === usernameInput && user.password === passwordInput;
    });

    // If user exists, 'login' the user
    if (user) {
        document.getElementById("loginCard").style.display = "none";
        document.getElementById("navbarLoginBtn").innerHTML="Hello, " + user.username + "!";
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
    xmlhttp.open("GET", filePath+cacheBuster, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
        return result;
    }
    else {
        throw new Error("Failed to load file");
    }
}