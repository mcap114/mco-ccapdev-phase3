//
document.addEventListener("DOMContentLoaded", function() {
    document.querySelector(".header-review-button").addEventListener("click", function() {
        let reviewWidget = document.getElementById("review-widget");
        if (reviewWidget.style.display === "none" || reviewWidget.style.display === "") {
            reviewWidget.style.display = "flex"; 
        } else {
            reviewWidget.style.display = "none"; 
        }
    });

    const stars = document.querySelectorAll('.star-rating i');
    let ratingValue;

    stars.forEach((star) => {
        star.addEventListener('click', () => {
            ratingValue = star.dataset.rating;
            stars.forEach((s) => s.classList.remove('active'));
            star.classList.add('active');
        });
    });

    document.querySelector('.submit-review-button').addEventListener('click', () => {    
        document.getElementById("review-widget").style.display = "none";
    });

    document.querySelector('.go-back-button').addEventListener('click', () => {
        document.getElementById("review-widget").style.display = "none";
    });
});

// function to expand text area
function autoExpand(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
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

// function when logging out
function logout() {
    console.log("Logout clicked");
    window.location.href = "homepageuser.html";
}

// closes the dropdown menu in avatar (header) 
window.addEventListener('click', function(event) {
    var dropdown = document.getElementById("myDropdown");
    var avatarButton = document.querySelector('.avatar-button');

    if (!event.target.closest('.avatar-button') && !event.target.closest('.avatar-dropdown-content')) {
        dropdown.style.display = 'none';
    }
});

// function to show the edit profile widget
function showEditProfileWidget() {
    var editProfileWidget = document.getElementById("edit-profile-widget");
    editProfileWidget.style.display = "block";
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

function unlikeWidget(button) {
    // get the parent widget of the button clicked
    const widget = button.closest('.favorite-place');
    
    if (widget) {
        widget.remove(); // remove the widget from the DOM
    }
}

function deleteWidget(button) {
    // get the parent widget of the button clicked
    const widget = button.closest('.coffee-shop-review');
    
    if (widget) {
        widget.remove(); // remove the widget from the DOM
    }
}

// event listener for go back button to hide the write a review widget
document.querySelector('.go-back-button').addEventListener('click', hideWriteAReviewWidget);

// event listener for go back button to hide the edit profile widget
document.querySelector('.go-back-button').addEventListener('click', hideEditProfileWidget);

// event listener for save button to save changes
document.querySelector('.save-button').addEventListener('click', saveChanges);

// 
function toggleOptions(event) {
    const dropdown = event.target.nextElementSibling;
    dropdown.classList.toggle("show");
}