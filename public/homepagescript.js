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
    window.location.href = "/logout";
}

// function to show logout dropdown
function toggleOptions(event) {
    const dropdown = event.target.nextElementSibling;
    dropdown.classList.add("show");
}

//
function redirectToProfile(userName) {
    window.location.href = '/profile/' + encodeURIComponent(userName);
}