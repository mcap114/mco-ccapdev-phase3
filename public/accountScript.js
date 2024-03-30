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
    let rememberMe = document.getElementById("remember-me").checked;

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
            password: passString,
            rememberMe: rememberMe
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

// profile page script 

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
            sessionStorage.setItem('username', usernameString);
            alert(data.message);
            updateProfilePage(data.userData);
            hideEditProfileWidget();
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

// function to show followers list
function showFollowers() {
    let followersWidget = document.getElementById("followers-widget");
    followersWidget.classList.toggle("visible");
}

// function to hide followers list
function hideFollowers() {
    let followersWidget = document.getElementById("followers-widget");
    followersWidget.classList.remove("visible");
}

// function to show following list
function showFollowing() {
    let followingWidget = document.getElementById("following-widget");
    followingWidget.classList.toggle("visible");
}

// function to hide following list
function hideFollowing() {
    let followingWidget = document.getElementById("following-widget");
    followingWidget.classList.remove("visible");
}

// function to show list of reviewed places
function showListReview() {
    let listReviewWidget = document.getElementById("listreview-widget");
    listReviewWidget.classList.toggle("visible");
}

// function to hide list of reviewed places
function hideListReview() {
    let listReviewWidget = document.getElementById("listreview-widget");
    listReviewWidget.classList.remove("visible");
}

// function to show the edit profile widget
function showEditProfileWidget() {
    var editProfileWidget = document.getElementById("edit-profile-widget");
    editProfileWidget.style.display = "block";
}

// function to update profile page with new data
function updateProfilePage(userData) {
    document.getElementById("name-field").innerText = userData.name;
    document.getElementById("username-field").innerText = userData.username;
    document.getElementById("bio-field").innerText = userData.bio;
}

// function to hide the edit profile widget
function hideEditProfileWidget() {
    var editProfileWidget = document.getElementById("edit-profile-widget");
    editProfileWidget.style.display = "none";
}

// function to show the photo upload section
function showPhotoUpload() {
    console.log("Show Photo Upload");
}

// function to update bio 
function updateBioText() {
    console.log("Update BioText");
}

// Function to change password
function changePassword() {
    console.log("Change Password");
}

// function to save changes
function saveChanges() {
    console.log("Save Changes");
}

// function to hide the write a review widget
function hideWriteAReviewWidget() {
    var writeReviewWidget = document.getElementById("review-widget");
    writeReviewWidget.style.display = "none";
}

// 
function unlikeWidget(establishmentName) {
    // Confirm action with the user (optional)
    if (confirm('Are you sure you want to remove this from favorites?')) {
        // Send AJAX request to remove from favorites
        fetch('/remove-from-favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ establishment_name: establishmentName }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            if (data.success) {
                // Remove the favorite place widget element from the UI
                const favPlaceElement = document.querySelector(`.fav-place-name:contains('${establishmentName}')`);
                console.log('Found element:', favPlaceElement);
                if (favPlaceElement) {
                    favPlaceElement.parentElement.parentElement.remove();
                    console.log('Widget removed from DOM.');
                } else {
                    console.log('Widget element not found in DOM.');
                    alert('Widget element not found!');
                }
            } else {
                console.log('Failed to remove from favorites:', data.message);
                alert('Failed to remove from favorites!');
            }
        })
        .catch(error => {
            console.error('Error:', error);

        });
    }
}

// 
function deleteCoffeeShopReview(placeName) {
    // Confirm action with the user (optional)
    if (confirm('Are you sure you want to remove this from your created reviews?')) {
        // Send AJAX request to remove from favorites
        fetch('/delete-coffee-shop-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ placeName: placeName }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            if (data.success) {
                // Remove the favorite place widget element from the UI
                const createdRevElement = document.querySelector(`.createdrev-place-name:contains('${placeName}')`);
                console.log('Found element:', createdRevElement);
                if (createdRevElement) {
                    createdRevElement.parentElement.parentElement.remove();
                    console.log('Widget removed from DOM.');
                } else {
                    console.log('Widget element not found in DOM.');
                    alert('Widget element not found!');
                }
            } else {
                console.log('Failed to remove from favorites:', data.message);
                alert('Failed to remove from favorites!');
            }
        })
        .catch(error => {
            console.error('Error:', error);

        });
    }
}

// Function to handle following a user
function followUser(username) {
    $.ajax({
        url: '/follow-user',
        type: 'POST',
        data: { username: username },
        success: function(response) {
            console.log(response); // Optional: Log the response from the server
            // Update the UI as needed
            updateFollowingList(); // Update the following list after following a user
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// Function to handle unfollowing a user
function unfollowUser(username) {
    $.ajax({
        url: '/unfollow-user',
        type: 'POST',
        data: { username: username },
        success: function(response) {
            console.log(response); // Optional: Log the response from the server
            // Update the UI as needed
            updateFollowingList(); // Update the following list after unfollowing a user
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// Function to update the following list on the myProfile page
function updateFollowingList() {
    $.ajax({
        url: '/get-following-list',
        type: 'GET',
        success: function(response) {
            console.log('Updated following list:', response);
            $('#following-widget').html(response); // Update the following widget with the new HTML
        },
        error: function(xhr, status, error) {
            console.error(error);
        }
    });
}

// event listener for go back button to hide the write a review widget
document.querySelector('.go-back-button').addEventListener('click', hideWriteAReviewWidget);

// event listener for go back button to hide the edit profile widget
document.querySelector('.go-back-button').addEventListener('click', hideEditProfileWidget);

// event listener for save button to save changes
document.querySelector('.save-button').addEventListener('click', saveChanges);