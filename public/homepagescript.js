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

// function when logging out
function logout() {
    console.log("Logout clicked");
    window.location.href = '/';
    res.locals.isLoggedIn = false;
    res.locals.isLoggedOut = true;
}

// closes the dropdown menu in avatar (header) 
window.addEventListener('click', function(event) {
    var dropdown = document.getElementById("myDropdown");
    var avatarButton = document.querySelector('.avatar-button');

    if (!event.target.closest('.avatar-button') && !event.target.closest('.avatar-dropdown-content')) {
        dropdown.style.display = 'none';
    }
});

// 
function toggleOptions(event) {
    const dropdown = event.target.nextElementSibling;
    dropdown.classList.toggle("show");
}

//
function redirectToProfile(userName) {
    window.location.href = '/profile/' + encodeURIComponent(userName);
}