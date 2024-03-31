const express = require('express');
const sessionController = require('./sessionController');
const userModel = require('../models/User');
const reviewModel = require('../models/Review');
const establishmentModel = require('../models/Establishment');
const avatarModel = require('../models/Avatar');
const bcrypt = require('bcrypt');
const moment = require('moment');

// Define the errorFn function
const errorFn = function (error) {
  console.error('Error:', error);
};

function addRoutes(server) {
  const router = express.Router();

  // route for search bar functionality
  router.get('/search', function(req, resp) {
    let key = req.query.key;
    console.log('\nCurrently searching ' + key);

    try {
      establishmentModel.find({
          $or: [
            { "establishment_name": { $regex: key, $options: "i" } },
            { "establishment_address": { $regex: key, $options: "i" } }
          ]
      }).lean().then(function(data) {
          resp.render('viewEstablishments', { 
            layout: 'index',
            establishment: data,
            key: key 
          });
      })
      .catch(function(error) {
        console.error(error);
      });
    } catch (error) {
        console.error(error);
    }
  });

  // route for non-user view homepage
  router.get('/', function (req, resp) {
    console.log('\nCurrently at Home Page');

    // calculate the date one week ago from the current date
    const oneWeekAgo = moment().subtract(7, 'days').toDate();

    // search query to find reviews posted in the past week
    const searchQuery = { date_posted: { $gte: oneWeekAgo } };

    establishmentModel.find({}).lean().then(function(establishment_data){
      let establishmentUpdatedRating = 0;

      establishment_data.forEach(function(establishment, index, establishments) {
        let totalRating = 0;
        let reviewCount = 0;

        reviewModel.find({ place_name: establishment.establishment_name }).lean().then(function(reviews) {
          reviewCount = reviews.length;
          reviews.forEach(function(review) {
            totalRating += parseInt(review.rating);
          });
          establishment.establishment_ratings = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

          establishmentModel.findOneAndUpdate({ establishment_name: establishment.establishment_name }, { establishment_ratings: establishment.establishment_ratings }, { new: true }).then(function(updatedEstablishment) {
            establishmentUpdatedRating++;
            if (establishmentUpdatedRating === establishments.length) {
              reviewModel.find(searchQuery).lean().then(function (review_data) {
                const noRecentReviews = review_data.length === 0;

                resp.render('main', {
                  layout: 'index',
                  title: 'Cofeed',
                  'review-data': review_data,
                  establishment: establishment_data,
                  currentUser: req.session.username,
                  currentUserIcon: req.session.user_icon,
                  noRecentReviews: noRecentReviews 
                });
              }).catch(function(error) {
                console.error('Error fetching reviews:', error);
                resp.redirect('/error');
              });
            }
          }).catch(function(error) {
            console.error('Error updating establishment with rating:', error);
            resp.redirect('/error');
          });
        }).catch(function(error) {
          console.error('Error fetching reviews for establishment:', error);
          resp.redirect('/error');
        });
      });
    }).catch(function(error) {
      console.error('Error fetching establishments:', error);
      resp.redirect('/error');
    });
  });

  //TODO: logic for checking ifLoggedin, displays landingPage if true otherwise goes to main
    
  // route for registration page
  router.get('/registration', function (req, res) {
    console.log('\nCurrently at Registration Page');
    res.render('registration', {
      layout: 'index',
      title: 'Registration',
    });
  });

  // route for creating user in the database
  router.post('/create-user', function(req, resp) {
    const saltRounds = 10;
  
    bcrypt.hash(req.body.password, saltRounds).then(function(hashedPassword) {
        const userInstance = userModel({
          name: req.body.name,
          username: req.body.username,
          bio: req.body.bio,
          email: req.body.email,
          password: hashedPassword,
          userType: req.body.userType
        });
  
        return userInstance.save();
      })
      .then(function(user) {
        console.log('User created');
        req.session.username = req.body.username;
        resp.json({ success: true, message: 'User created successfully' });
      })
      .catch(function(error) {
        errorFn(error);
        resp.status(500).json({ status: 'error', message: 'Internal Server Error' });
      });
  });

  // route for registration page (choosing an avatar)
  router.get('/registrationAvatar', function (req, res) {
    console.log('\nCurrently choosing an avatar');
    const { username } = req.session; 
    const searchQuery = {};

    console.log('\nUser ', username);

    userModel.findOne({ username: username }).then(user =>{
      avatarModel.find(searchQuery).lean().then(function(avatars){
        res.render('registrationAvatar', {
          layout: 'index',
          title: 'Registration Avatar',
          username: username,
          user_icon: avatars
        });
      });
    });
  });

  // route for saving the avatar chosen by the user in the database
  router.post('/choose-avatar', function(req, res) {
    console.log('\nAvatar saved successfully');
    const { username } = req.session;
    const { user_icon } = req.body;

    if (!username) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    userModel.findOne({ username: username }).then(user => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.user_icon = user_icon;

      return user.save();
    })
    .then(() => {
      console.log('Avatar saved for user:', username);
      res.json({ success: true, message: 'Avatar saved successfully'});
    })
    .catch(error => {
      console.error('Error saving avatar:', error);
      res.status(500).json({ success: false, message: 'Failed to save avatar' });
    });
  });

  // route for login page
  router.get('/login', function (req, res) {
    console.log('\nCurrently at Login Page');
    res.render('login', {
      layout: 'index',
      title: 'Login',
    });
  });

  // route for reading user from the database to login
  router.post('/read-user', function(req, resp) {
    try {
      const { username, password } = req.body;
  
      // Find user by username
      userModel.findOne({ username }).then(function(user) {
        console.log("\nFinding user: ", username);
  
        if (user) {
          // Compare hashed password from database with provided password
          bcrypt.compare(password, user.password).then(function(passwordMatch) {
            if (passwordMatch) {
              req.session.username = user.username;
              req.session.user_icon = user.user_icon;
              req.session.userType = user.userType;
              if (req.body.rememberMe) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21; 
              }
              console.log("\nUser ", req.session.username, " Found");
              console.log("User Type:", req.session.userType);
              resp.json({ success: true });
            } else {
              // Passwords don't match
              console.log("\nPasswords do not match for user: ", username);
              resp.json({ success: false });
            }
          });
        } else {
          // User not found
          console.log("\nUser not found with username: ", username);
          resp.json({ success: false });
        }
      }).catch(function(error) {
        errorFn(error);
        return resp.status(500).json({ status: 'error', msg: 'Internal Server Error' });
      });
    } catch (error) {
      errorFn(error);
      return resp.status(500).json({ status: 'error', msg: 'Internal Server Error' });
    }
  });

  // route for getting forgot password page
  router.get('/forgotpassword', function (req, res) {
    console.log('\nCurrently at Forgot Password Page');
    res.render('forgotpassword', {
      layout: 'index',
      title: 'Forgot Password',
    });
  });

  // route for updating the database of new password when forgotten
  router.post('/forgot-password', function(req, resp) {
    const { username, newPassword } = req.body;
    const saltRounds = 10; 

    bcrypt.hash(newPassword, saltRounds).then(function(hashedPassword) {
        userModel.findOne({ username }).then(function(user) {
            if (user) {
              user.password = hashedPassword;
              return user.save();
            } else {
              console.log("\nUser not found with username: ", username);
              return Promise.reject({ success: false, message: 'Username not found' });
            }
          })
          .then(function(updatedUser) {
            console.log("\nPassword updated successfully for user: ", updatedUser.username);
  
            req.session.username = updatedUser.username;
            req.session.user_icon = updatedUser.user_icon;
            req.session.userType = updatedUser.userType;
            console.log("\nUser ", req.session.username, " Found");
            console.log("User Type:", req.session.userType);
            console.log("\n");
            resp.json({ success: true, message: 'Password updated successfully' });
          })
          .catch(function(error) {
            errorFn(error);
            resp.status(500).json({ status: 'error', message: 'Internal Server Error' });
          });
      })
      .catch(function(error) {
        errorFn(error);
        resp.status(500).json({ status: 'error', message: 'Internal Server Error' });
      });
  });
  
  // route for user view homepage
  router.get('/landingPage', function (req, resp) {
    console.log('\nCurrently at Landing Page');
    const searchQuery = {};

    reviewModel.find(searchQuery).lean().then(function(review_data){
      establishmentModel.find(searchQuery).lean().then(function(establishment_data){
        resp.render('landingPage', {
          layout: 'index',
          title: 'Cofeed',
          'review-data': review_data,
          'establishment-data': establishment_data,
          currentUser: req.session.username,
          currentUserIcon: req.session.user_icon,
          currentUserType: req.session.userType
        });
      });
    });
  });

  // route for view establishments
  router.get('/viewEstablishments', function(req, resp){
    console.log('\nCurrently at View Establishments Page');
    const searchQuery = {};
    let headlineLocation = 'List of Establishments';

    establishmentModel.find(searchQuery).lean().then(function(establishment_data){
      establishment_data.forEach(function(establishment) {
        establishment.isMetro = establishment.establishment_address.includes('Metro Manila');
      });

      resp.render('viewEstablishments', {
        layout: 'index',
        title: 'Cofeed',
        establishment: establishment_data,
        headlineLocation: headlineLocation,
        currentUser: req.session.username,
        currentUserIcon: req.session.user_icon
      });
    });
  }); 

  // route for view establishments with filters
  router.post('/viewEstablishments', function(req, resp){
    let searchQuery = {};
    let headlineLocation = '';

    // filter by price
    const priceRanges = req.body.price_range;
    if (priceRanges && priceRanges.length > 0) {
      searchQuery.price_range = { $in: priceRanges };
      console.log('\nCurrently searching establishments with price range: ', priceRanges);
    }

    // filter by services offered
    const servicesOffered = req.body.services_offered;
    if (servicesOffered && servicesOffered.length > 0) {
      searchQuery.services_offered = { $in: servicesOffered };
      console.log('\nCurrently searching establishments with services offered: ', servicesOffered);
    }

    // filter by area
    const selectedArea = req.body.area; 
    if (selectedArea) {
      searchQuery.establishment_address = selectedArea === 'metro' ? /Metro Manila/ : { $not: /Metro Manila/ };
      console.log('\nCurrently searching establishments in ', selectedArea);
    }

    // filter by location
    const location = req.body.location; 
    if (location) {
      searchQuery.establishment_address = { $regex: new RegExp(location, 'i') };
      console.log('\nCurrently searching establishments in ', location);
    }

    establishmentModel.find(searchQuery).lean().then(function(establishment_data){
      if (establishment_data.length === 0) {
        headlineLocation = 'No establishments found matching the criteria.';
        console.log('\nNo establishments found matching the filter applied');
      } else {
          establishment_data.forEach(function(establishment) {
            establishment.isMetro = establishment.establishment_address.includes('Metro Manila');
          });
  
          let isMetroEstablishmentPresent = false;
          let isNonMetroEstablishmentPresent = false;
  
          establishment_data.forEach(function(establishment) {
            if (establishment.isMetro) {
              isMetroEstablishmentPresent = true;
            } else {
              isNonMetroEstablishmentPresent = true;
            }
          });
  
          if (location) {
            headlineLocation = 'Establishments in ' + location;
        } else if (isMetroEstablishmentPresent && isNonMetroEstablishmentPresent) {
            headlineLocation = 'Establishments in Metro Manila and Outside Metro Manila';
            console.log('\nCurrently searching establishments both in Metro Manila and Outside Metro Manila');
        } else if (isMetroEstablishmentPresent) {
            headlineLocation = 'Establishments in Metro Manila';
        } else {
            headlineLocation = 'Establishments Outside Metro Manila';
        }
        
      }

      resp.render('viewEstablishments', {
        layout: 'index',
        title: 'Cofeed',
        establishment: establishment_data,
        headlineLocation: headlineLocation,
        currentUser: req.session.username,
        currentUserIcon: req.session.user_icon
      });
    });  
  });

  // read establishment
  router.get('/establishment/:name', function (req, resp) {
    const establishmentName = req.params.name;
    const establishmentSearchQuery = { establishment_name: establishmentName };
    const reviewSearchQuery = { place_name: establishmentName};
    const ratingFilter = req.query.rating;
    console.log('\nCurrently at Establishment Page: ' + establishmentName);
    console.log('Username:', req.session.username);
    
    establishmentModel.findOne(establishmentSearchQuery).lean().then(function(establishment_data) {
      reviewModel.find(reviewSearchQuery).lean().then(function(review_data){
        if (!establishment_data) {
          console.log('Establishment data not found.');
          resp.redirect('/error');
          return;
        }

        const reviewCount = review_data.length;

        if (ratingFilter) {
          review_data = review_data.filter(review => review.rating.toString() === ratingFilter);
        }

        const ratingDistribution = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        };
        
        review_data.forEach(function (review) {
            ratingDistribution[review.rating]++;
        });

        console.log('Rating Distribution:', ratingDistribution);
          
        //console.log('Establishment Data:', establishment_data);
        //console.log('Review Data: ', review_data);
        resp.render('establishment', {
          layout: 'index',
          title: establishmentName,
          reviewData: review_data,
          establishment: establishment_data,
          reviewCount: reviewCount,
          currentUser: req.session.username,
          currentUserIcon: req.session.user_icon,
          currentUserType: req.session.userType,
          selectedRatingFilter: ratingFilter,
          establishmentRating: establishment_data.establishment_ratings,
          ratingDistribution: JSON.stringify(ratingDistribution)
        });
      });
    });
  });

  // AAAAAAA ESTAB SAVES TO FAVORITES !!!!!!! TIME CHECK 2:18AM
  router.post('/add-to-favorites', function(req, res) {
    try {
      console.log('Request body:', req.body); 
  
      // retrieve the establishment name from the request body
      const establishment_name = req.body.establishment_name;
      console.log('Establishment name:', establishment_name);
  
      const username = req.session.username;
      console.log('Username:', username);
  
      // find the user document in the database
      userModel.findOne({ username }).then(function(user) {
          console.log('User found:', user);
  
          // check if the user exists
          if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
          }
  
          // update the user's favorite establishments
          if (!user.favoriteplace.includes(establishment_name)) {
            user.favoriteplace.push(establishment_name);
            console.log('Favorite place added:', establishment_name);
            return user.save();
          } else {
            // establishment already in favorites
            console.log('Establishment is already a favorite.');
            return Promise.reject({ success: false, message: 'Establishment is already a favorite.' });
          }
        })
        .then(function() {
          return res.json({ success: true, message: 'Added to favorites!' });
        })
        .catch(function(error) {
          console.error('Error:', error);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'An error occurred' });
    }
  });
  
  // still a work in progress 
  // Currently it is able to reflect the submitted user_photo, username and date posted to the database
  router.post('/submit-review', function(req, res) {
    try {
      // extract review data from the request body
      const review_title = req.body.review_title;
      const review_location = req.body.review_location;
      const review_description = req.body.review_description;
      const review_rating = req.body.review_rating;
  
      // create a new review document
      const newReview = new reviewModel({
        user_photo: req.session.user_icon,
        display_name: req.session.name,
        username: req.session.username,
        rating: review_rating,
        review_title: review_title,
        establishment_name: review_location,
        caption: review_description,
        date_posted: new Date()
      });
  
      // save the review to the database
      newReview.save().then(function() {
          res.json({ success: true, message: 'Review submitted successfully!' });
        })
        .catch(function(error) {
          console.error('Error:', error);
          res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
        });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
    }
  });

  //goofy route, 100% scalable industry-ready
  router.get('/profile/:name', function (req, resp) {
    const userName = req.params.name;
    const searchQuery = { username: userName };
    console.log('\nCurrently at Profile Page of ' + userName);
  
    const loggedInUser = req.session.username;

    userModel.findOne(searchQuery).lean().then(function(user_data) {
      if (!user_data) {
        console.log('User data not found.');
        resp.redirect('/error');
        return;
      }

    const followingList = user_data.following || [];
    const followerList = user_data.followers || [];

    const reviewSearchQuery = {username : user_data.username};

    reviewModel.find(reviewSearchQuery).lean().then(function(review_data) {
      const favoritePlaces = user_data.favoriteplace || []; 
      const establishmentSearchQuery = { establishment_name: { $in: favoritePlaces } };
      
      establishmentModel.find(establishmentSearchQuery).lean().then(function(establishment_data){
        
        const isOwnProfile = user_data.username === req.session.username;
        const isFollowing = user_data.followers.includes(loggedInUser);
  
        // console.log('User Data:', user_data);
        // console.log('Establishment Data:', establishment_data);
        resp.render(isOwnProfile ? 'myProfile' : 'profile', {
          layout: 'index',
          title: user_data.name,
          'user-data': user_data,
          'establishment-data': establishment_data,
          'review-data': review_data,
          currentUser: req.session.username,
          currentUserIcon: req.session.user_icon,
          user: user_data,
          isFollowing: isFollowing
        });
      });
    });
    }).catch(errorFn);
  });

 // Route to follow a user
router.post('/follow/:username', function(req, res) {
  const loggedInUser = req.session.username;
  const usernameToFollow = req.params.username;

  userModel.findOneAndUpdate(
      { username: loggedInUser },
      { $addToSet: { following: usernameToFollow } }, // Add to following list
      { new: true }
  ).then(user => {
      if (!user) {
          return res.status(404).send('User not found.');
      }
      res.send(user);
  }).catch(err => {
      console.error('Error following user:', err);
      res.status(500).send('Error following user.');
  });
});

// Route to unfollow a user
router.post('/unfollow/:username', function(req, res) {
  const loggedInUser = req.session.username;
  const usernameToUnfollow = req.params.username;

  userModel.findOneAndUpdate(
      { username: loggedInUser },
      { $pull: { following: usernameToUnfollow } }, // Remove from following list
      { new: true }
  ).then(user => {
      if (!user) {
          return res.status(404).send('User not found.');
      }
      res.send(user);
  }).catch(err => {
      console.error('Error unfollowing user:', err);
      res.status(500).send('Error unfollowing user.');
  });
});


  // route for updating user's information on profile page
  router.post('/update-user', function(req, resp){
    const updateQuery = { username: req.session.username };

    userModel.findOne(updateQuery).then(function(user) {
        // if user found
        if (user && user._id) {
            const { name, username, bio, password } = req.body;

            // updating user information
            user.name = name;
            user.username = username;
            user.bio = bio;
            user.password = password;
            user.confirmpassword = password;

            // saving the updated user information
            user.save().then(function(result) {
                req.session.username = user.username;
                req.session.user_icon = user.user_icon;
                req.session.userType = user.userType;
                console.log('User updated successfully:', result);
                return resp.redirect('/profile/' + user.username); // Redirect to profile page
            }).catch(function(error) {
                console.error('Error saving user:', error);
                return resp.status(500).json({ success: false, message: 'Failed to update user information' });
            });
        } else {
            return resp.status(404).json({ success: false, message: 'User not found' });
        }
    }).catch(function(error) {
        console.error('Error finding user:', error); // Log find error
        return resp.status(500).json({ success: false, message: 'Internal Server Error' });
    });
  });

  //
  router.post('/remove-from-favorites', function(req, res) {
    try {
      console.log('Request body:', req.body); 

      // Retrieve the establishment name from the request body
      const establishment_name = req.body.establishment_name;
      console.log('Establishment name:', establishment_name);

      const username = req.session.username;
      console.log('Username:', username);

      // Find the user document in the database
      userModel.findOne({ username }).then(function(user) {
          console.log('User found:', user);

          // Check if the user exists
          if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          // Update the user's favorite establishments
          const index = user.favoriteplace.indexOf(establishment_name);
          if (index !== -1) {
            user.favoriteplace.splice(index, 1);
            console.log('Favorite place removed:', establishment_name);
            return user.save();
          } else {
            // Establishment not found in favorites
            console.log('Establishment not found in favorites.');
            return Promise.reject({ success: false, message: 'Establishment not found in favorites.' });
          }
        })
        .then(function() {
          return res.json({ success: true, message: 'Removed from favorites!' });
        })
        .catch(function(error) {
          console.error('Error:', error);
          return res.status(500).json({ success: false, message: 'An error occurred' });
        });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'An error occurred' });
    }
  });

  router.post('/remove-review', async (req, res) => {
    const reviewId = req.body.review_id;

    try {
        const deletedReview = await reviewModel.findByIdAndDelete(reviewId);
        if (!deletedReview) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }
        // Optionally, update other data or perform additional actions here
        return res.json({ success: true, message: 'Review removed successfully' });
    } catch (err) {
        console.error('Error deleting review:', err);
        return res.status(500).json({ success: false, message: 'An error occurred' });
    }
});

  return router;
}

module.exports = {
  addRoutes: addRoutes,
};