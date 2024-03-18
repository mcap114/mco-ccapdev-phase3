// 
document.addEventListener("DOMContentLoaded", function() {
  // Set the Create Post's date to the current date
  let today = new Date();
  let formattedDate = formatDate(today);

  document.querySelector("input#post-date").value = formattedDate;
  updateStarRatings();

  const starContainers = document.querySelectorAll('.star-rating');
    starContainers.forEach(container => {
        container.addEventListener('click', function(event) {
            const rating = parseInt(event.target.getAttribute('data-rating'), 10);
            // Update data-rating attribute of parent container
            container.setAttribute('data-rating', rating);
            updateStarRatings();
        });
    });

    const favoriteButtons = document.querySelectorAll('.favorite');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const establishment_name = event.target.dataset.establishment_name;
            addToFavorites(establishment_name);
          });
        });
});

// still doesnt fully function (in progress)
function addToFavorites(establishment_name) {
  // Send a POST request to the server with the establishment name
  fetch('/add-to-favorites', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ establishment_name }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
      // Handle the response from the server
      if (data.success) {
          // Update UI to indicate that establishment was added to favorites
          alert('Added to favorites!');
          // You can optionally update the UI here to reflect the change
      } else {
          alert('Failed to add to favorites. Please try again.');
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

// 
function getStarsHTML(rating) {
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
      starsHTML += i <= rating ? '<span class="fa fa-star checked"></span>' : '<span class="fa fa-star"></span>';
  }
  return starsHTML;
}