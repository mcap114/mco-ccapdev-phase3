
document.addEventListener("DOMContentLoaded", function() {
  var starRatingContainers = document.querySelectorAll(".star-rating-container");
  starRatingContainers.forEach(function(container) {
    var establishmentRating = parseFloat(container.dataset.rating);
    var fullStars = Math.floor(establishmentRating);
    var hasHalfStar = establishmentRating - fullStars >= 0.5;

    var starsHtml = '';
    for (var i = 0; i < fullStars; i++) {
        starsHtml += '<span class="fa fa-star checked"></span>';
    }
    if (hasHalfStar) {
        starsHtml += '<span class="fa fa-star-half-o checked"></span>';
    }
    for (var j = 0; j < 5 - Math.ceil(establishmentRating); j++) {
        starsHtml += '<span class="fa fa-star"></span>';
    }

    container.querySelector('.star-rating').innerHTML = starsHtml;
  });

  // Set the Create Post's date to the current date
  let today = new Date();
  let formattedDate = formatDate(today);

  document.querySelector("input#post-date").value = formattedDate;
  updateStarRatings();

    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
      button.addEventListener('click', function(event) {
        const establishment_name = event.target.dataset.establishment_name;
        addToFavorites(establishment_name);
        });
      });

    const reviewForm = document.getElementById('post-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', submitReview);
    }
    
    initStarRatings(); //write review star rating baka makalimutan ko ulit
    initEditReviewStars();
    hideEditReviewWidget();
    hideEditEstablishmentWidget();
});

// function to add establishment to current user's favorites
function addToFavorites(establishment_name) {
  // Send a POST request to the server with the establishment name
  fetch('/add-to-favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ establishment_name }),
  })
  .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add to favorites. Please try again.');
      }
      return response.json();
  })
  .then(data => {
      console.log(data);
      if (data.success) {
        alert('Added to favorites!');
      } else {
        alert(data.message);
      }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while processing your request.');
  });
}

// initialize write review star rating
function initStarRatings() {
  const writeReviewStars = document.querySelectorAll('.write-review-rating .fa');
  writeReviewStars.forEach(star => {
    star.addEventListener('click', function(e) {
      updateStars(writeReviewStars, e.target.dataset.rating);
    });
  });
}

// initialize edit review star rating
function initEditReviewStars() {
  const editReviewStars = document.querySelectorAll('.edit-review-rating .fa');
  editReviewStars.forEach(star => {
    star.addEventListener('click', function(e) {
      updateStars(editReviewStars, e.target.dataset.rating);
    });
  });
}

// 
function updateStars(starSet, ratingValue) {
  starSet.forEach((star, index) => {
    if (index < ratingValue) {
      star.classList.add('highlighted');
    } else {
      star.classList.remove('highlighted');
    }
  });
}

// function to expand text area
function autoExpand(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Function to handle review submission
function submitReview(event) {
  event.preventDefault(); 

  // Get form data
  const formData = new FormData(event.target);

  // Manually append the star rating
  const highlightedStars = document.querySelectorAll('.review-rating .fa.highlighted');
  const ratingValue = highlightedStars.length; // Number of highlighted stars equals the rating
  formData.append('review_rating', ratingValue);
  
  // Log the form data before sending it to the server
  console.log('Form Data:', formData);

  // Send POST request to server
  fetch('/submit-review', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to submit review. Please try again.');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    if (data.success) {
      alert('Review submitted successfully!');
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while processing your request.');
  });
}

// write a review date
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// write a review preview of photo when uploading
function previewPhoto(event) {
  const fileInput = event.target;
  const photoPreview = document.getElementById('photo-preview');

  photoPreview.innerHTML = '';

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      
      const previewImage = document.createElement('img');
      previewImage.setAttribute('src', e.target.result);
      previewImage.setAttribute('alt', 'Preview');
      previewImage.classList.add('preview-image');

      photoPreview.prepend(previewImage);
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
}

//
function redirectToEstablishment(establishmentName) {
  window.location.href = '/establishment/' + encodeURIComponent(establishmentName);
}

// 
function updateStarRatings() {
  // Target only review ratings
  const ratingContainers = document.querySelectorAll('.dynamic-star-rating');
  ratingContainers.forEach(container => {
    const rating = parseInt(container.getAttribute('data-rating'), 10);
    container.innerHTML = getStarsHTML(rating);
  });
}

// function to display the rating number to stars from review
function getStarsHTML(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    starsHTML += i <= rating ? '<span class="fa fa-star checked"></span>' : '<span class="fa fa-star"></span>';
  }
  return starsHTML;
}

// function to show the edit profile widget
function showEditReviewWidget() {
  var editReviewWidget = document.getElementById("edit-review-widget");
  editReviewWidget.style.display = "block";
}

// function to hide the edit profile widget
function hideEditReviewWidget() {
  var editReviewWidget = document.getElementById("edit-review-widget");
  editReviewWidget.style.display = "none";
}

// function to show the edit profile widget
function showEditEstablishmentWidget() {
  var editEstablishmentWidget = document.getElementById("edit-establishment-widget");
  editEstablishmentWidget.style.display = "block";
}

// function to hide the edit profile widget
function hideEditEstablishmentWidget() {
  var editEstablishmentWidget = document.getElementById("edit-establishment-widget");
  editEstablishmentWidget.style.display = "none";
}

// not yet implemented function to save changes
function saveChanges() {
  console.log("Save Changes");
}

// function when filtering reviews by its ratings
function applyRatingFilter(rating) {
  window.location.href = window.location.pathname + '?rating=' + rating;
}

// event listener for save button to save changes
document.querySelector('.save-button').addEventListener('click', saveChanges);