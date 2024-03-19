// function to make password visible or not
function togglePasswordVisibility(passwordFieldId, toggleIconId) {
    let passwordField = document.getElementById(passwordFieldId);
    let toggleIcon = document.getElementById(toggleIconId);

    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.src = "https://i.imgocean.com/eye-openf95409e2a49605ae.png";
    } else {
        passwordField.type = "password";
        toggleIcon.src = "https://i.imgocean.com/eye-close6c91a6ac25495e1f.png";
    }
}

// function when submitting the form of a new registered user
function submitForm() {
    let nameString = document.forms["create-user"]["name"].value;
    let emailString = document.forms["create-user"]["email"].value;
    let usernameString = document.forms["create-user"]["username"].value;
    let bioString = document.forms["create-user"]["bio"].value;
    let pass1String = document.forms["create-user"]["password"].value;
    let pass2String = document.forms["create-user"]["password2"].value;

    let userType = document.querySelector('input[name="userType"]:checked').value;

    if (nameString.length < 1) {
        alert("Name cannot be empty");
        return false;
    } else if (emailString.length < 1) {
        alert("Email cannot be empty");
        return false;
    } else if (usernameString.length < 1) {
        alert("Username cannot be empty");
        return false;
    } else if (pass1String !== pass2String) {
        alert("Passwords do not match!");
        return false;
    }

    // making a POST request to the server to create a new user
    fetch('/create-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: nameString,
            username: usernameString,
            bio: bioString,
            email: emailString,
            password: pass1String,
            password2: pass2String,
            userType: userType
        })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;        
        } else {
            return response.json(); // parsing the JSON response
        }
    })
    .then(data => {
        if (data && data.success) {
            alert(data.message);
            window.location.href = 'registrationAvatar';
        } else {
            alert('Failed to create user: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the user.');
    });

    return false;
}

// function to redirect to login page
function redirectToLoginPage() {
    window.location.href = 'login';
    return false; 
}

// function when submitting the form of a user logging in
function submitLoginForm() {
    let usernameString = document.getElementById("username-field").value;
    let passString = document.getElementById("password-field").value;

    if (usernameString.length < 1) {
        alert("Username cannot be empty");
        return false;
    } else if (passString.length < 1) {
        alert("Password cannot be empty");
        return false;
    }

    // making a POST request to the server to log in
    fetch('/read-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameString,
            password: passString
        })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;        
        } else {
            return response.json(); // parsing the JSON response
        }
    })
    .then(data => {
        if (data && data.success) {
            window.location.href = 'landingPage';
        } else {
            alert('username and password do not match');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the user.');
    });

    return false;
}

// function when submitting form for forgotten new password
function submitForgotPasswordForm() {
    let usernameString = document.getElementById("username-field").value;
    let passString = document.getElementById("password-field").value;

    if (usernameString.length < 1) {
        alert("Username cannot be empty");
        return false;
    } else if (passString.length < 1) {
        alert("Password cannot be empty");
        return false;
    }

    // making a POST request to the server to update password
    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameString,
            password: passString
        })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;        
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data && data.success) {
            alert(data.message);
            window.location.href = 'landingPage';
        } else {
            alert(data.message); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the password.');
    });

    return false;
}

// function when updating user information
function updatingUserForm() {
    let nameString = document.getElementById("name-field").value;
    let usernameString = document.getElementById("username-field").value;
    let bioString = document.getElementById("bio-field").value;
    let passString = document.getElementById("password-field").value;

    // making a POST request to the server to update password
    fetch('/update-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: usernameString,
            name: nameString,
            username: usernameString,
            bio: bioString,
            password: passString,
            password2: passString,
        })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;        
        } else {
            return response.json();
        }
    })
    .then(data => {
        if (data && data.success) {
            alert(data.message);
        } else {
            alert(data.message); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the user information.');
    });

    return false;
}