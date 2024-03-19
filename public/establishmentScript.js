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

// owner edit establishment functions

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
// function to save changes
function saveChanges() {
  console.log("Save Changes");
}

// event listener for go back button to hide the edit profile widget
document.querySelector('.go-back-button').addEventListener('click', hideEditProfileWidget);

// event listener for save button to save changes
document.querySelector('.save-button').addEventListener('click', saveChanges);
