document.addEventListener("DOMContentLoaded", function() {
  
  // stars for establishment_ratings
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

  // progress bar for reviews
  var reviewCount = parseInt(document.getElementById('progressBars').dataset.reviewCount);
  var ratingDistribution = JSON.parse(document.getElementById('progressBars').dataset.ratingDistribution);
  var progressBarsContainer = document.getElementById('progressBars');

  for (var rating = 5; rating >= 1; rating--) {
    var progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    var width = (ratingDistribution[rating] || 0) / reviewCount * 100;
    progressBar.style.width = width + '%';

    var stars = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<span class="progress-star fa fa-star checked"></span>';
      } else {
        stars += '<span class="progress-star fa fa-star"></span>';
      }
    }
    var reviewText = '(' + (ratingDistribution[rating] || 0) + ')';
    progressBar.innerHTML = stars + ' ' + reviewText;

    progressBarsContainer.appendChild(progressBar);
  }

  // Set the Create Post's date to the current date
  let today = new Date();
  let formattedDate = formatDate(today);

  document.querySelector("input#post-date").value = formattedDate;
  updateStarRatings();

  // add to favorite establishment
  const favoriteButtons = document.querySelectorAll('.favorite');
  favoriteButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      const establishment_name = event.target.dataset.establishment_name;
      addToFavorites(establishment_name);
    });
  });

  // writing a review
  const reviewForm = document.getElementById('post-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', submitReview);
  }

  // edit review form
  const editreviewForms = document.querySelectorAll('[id^="editForm-"]');
  editreviewForms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      const reviewId = this.dataset.reviewId;

      if (editreviewForms) {
        event.preventDefault();
      }
    });
  });

  document.querySelectorAll('.review-rating .fa-star').forEach(function(star) {
    star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        highlightStars(rating);
    });
  });
  
  initStarRatings(); //write review star rating 
  initEditReviewStars();

    const submitCommentButton = document.getElementById('post-comment-button');
    if (submitCommentButton) {
        submitCommentButton.addEventListener('click', function() {
            console.log('Comment Button clicked');
            // Add any additional code here to handle the comment submission
        });
    } else {
        console.error('Submit comment button not found');
    }
  });



// function to add establishment to current user's favorites
function addToFavorites(establishment_name) {
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

// function when filtering reviews by its ratings
function applyRatingFilter(rating) {
  window.location.href = window.location.pathname + '?rating=' + rating;
}

// function to handle write a review
function submitReview() {
  const review_title = document.getElementById('review-title').value;
  const place_name = document.getElementById('review-location').value;
  const caption = document.getElementById('review-description').value;
  const rating = getStarRating();
  const reviewsCountElement = document.getElementById('reviews-count');
  
  if (rating === 0) {
    alert('Please select a star rating.');
    return; 
  }

  fetch('/submit-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        review_title: review_title,
        place_name: place_name,
        caption: caption,
        rating: rating
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
    if (data && data.success) {
      alert(data.message);
      
      if (reviewsCountElement) {
        const newReviewCount = parseInt(reviewsCountElement.innerText.split(' ')[0]) + 1;
        reviewsCountElement.innerText = newReviewCount + ' reviews';
      }
  } else {
      alert('Failed to create review: ' + data.message);
  }
  })
  .catch(error => {
      console.error('Error submitting review:', error);
  });
}

// function to highlight selected stars in writing a review
function highlightStars(rating) {
  const stars = document.querySelectorAll('.review-rating .fa-star');
  stars.forEach(function(star, index) {
      if (index < rating) {
        star.classList.add('checked');
      } else {
        star.classList.remove('checked');
      }
  });
}

// function to retrieve the selected star rating in writing a review
function getStarRating() {
  const stars = document.querySelectorAll('.review-rating .fa-star.checked');
  return stars.length; 
}
function submitComment(reviewId) {
  const commentInput = document.getElementById(`commentInput-${reviewId}`);
  console.log('commentInput:', commentInput); // Debug output

  // Check if commentInput is null
  if (!commentInput) {
      console.error(`Element with ID 'commentInput-${reviewId}' not found.`);
      return;
  }

  // Access the value property if the element exists
  const commentValue = commentInput.value;
  console.log('commentValue:', commentValue); // Debug output

  // Check if comment is empty
  if (!commentValue.trim()) {
      alert('Comment cannot be empty');
      return;
  }

  const formData = {
      reviewId: reviewId,
      comment: commentInput
  };
  console.log('formData:', formData); // Debug output

  fetch('/submit-comment', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Response data:', data); // Debug output
      if (data.success) {
          // Reload the page or update the UI to display the new comment
          console.log('Comment Posted!');
          // Refresh comments after posting
          refreshComments(reviewId);
      } else {
          alert('Failed to submit comment: ' + data.message);
      }
  })
  .catch(error => {
      console.error('Error submitting comment:', error);
      alert('An error occurred while submitting the comment.');
  });
}

// Function to fetch comments for a review and update UI
function refreshComments(reviewId) {
  fetch(`/comments/${reviewId}`)
  .then(response => response.json())
  .then(data => {
      // Assuming there's a function to update the UI with comments
      updateCommentUI(data.comments);
  })
  .catch(error => {
      console.error('Error fetching comments:', error);
  });
}

// function to show edit review widget
function showEditReviewWidget(reviewId) {
  const editWidget = document.getElementById(`edit-widget-${reviewId}`);
  editWidget.style.display = 'block';
}

// function to hide edit review widget
function hideEditReviewWidget(reviewId) {
  const editWidget = document.getElementById(`edit-widget-${reviewId}`);
  editWidget.style.display = "none";;
}

// function to edit review
function editReview(reviewId) {
  const review_title = document.getElementById('review_title').value;
  const caption = document.getElementById('caption').value;

  fetch(`/edit-review/${reviewId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      review_title: review_title,
      caption: caption
  })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data && data.success) {
      alert(data.message);
      hideEditReviewWidget(reviewId);
    } else {
      alert('Failed to edit review: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error editing review:', error);
  });
}

// Function to update establishment details via AJAX
function editEstablishment(establishmentId) {
  // Retrieve updated establishment details from form inputs
  const establishmentName = document.getElementById('establishment_name').value;
  const establishmentAddress = document.getElementById('establishment_address').value;
  const establishmentDescription = document.getElementById('establishment_description').value;

  // Log the input values
  console.log('Establishment ID:', establishmentId);
  console.log('Establishment Name:', establishmentName);
  console.log('Establishment Address:', establishmentAddress);
  console.log('Establishment Description:', establishmentDescription);

  fetch(`/edit-establishment/${establishmentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      establishment_name: establishmentName,
      establishment_address: establishmentAddress,
      establishment_description: establishmentDescription
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Establishment details updated successfully!');
      // Update the URL to reflect the new establishment name
      const newUrl = window.location.href.replace(/establishment\/[^/]+/, `establishment/${establishmentName}`);
      history.pushState({}, '', newUrl);
      // Reload the page to fetch the updated establishment data
      window.location.reload();
    } else {
      alert('Failed to update establishment details: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error updating establishment details:', error);
    alert('An error occurred while updating establishment details.');
  });
}