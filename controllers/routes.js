const express = require('express');
const sessionController = require('./sessionController');
const userModel = require('../models/User');
const reviewModel = require('../models/Review');
const establishmentModel = require('../models/Establishment');
const bcrypt = require('bcrypt');

// Define the errorFn function
const errorFn = function (error) {
  console.error('Error:', error);
};

function addRoutes(server) {
  const router = express.Router();

  // route for non-user view homepage
  router.get('/', function (req, resp) {
    console.log('\nCurrently at Home Page');
    const searchQuery = {};

    reviewModel.find(searchQuery).lean().then(function(review_data){
      resp.render('main', {
        layout: 'index',
        title: 'Cofeed',
        'review-data': review_data
      });
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

  // route for registration page (choosing an avatar)
  router.get('/registrationAvatar', function (req, res) {
    console.log('\nCurrently at Registration Avatar Page');
    res.render('registrationAvatar', {
      layout: 'index',
      title: 'Registration Avatar',
    })
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
        resp.json({ success: true, message: 'User created successfully' });
      })
      .catch(function(error) {
        errorFn(error);
        resp.status(500).json({ status: 'error', message: 'Internal Server Error' });
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

  // route for forgot password page
  router.get('/forgotpassword', function (req, res) {
    console.log('\nCurrently at Forgot Password Page');
    res.render('forgotpassword', {
      layout: 'index',
      title: 'Forgot Password',
    });
  });

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
    
    establishmentModel.find(searchQuery).lean().then(function(establishment_data){
      resp.render('viewEstablishments', {
        layout: 'index',
        title: 'Cofeed',
        establishment: establishment_data,
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
    console.log('\nCurrently at Establishment Page: ' + establishmentName);
    console.log('Username:', req.session.username);
    
    establishmentModel.findOne(establishmentSearchQuery).lean().then(function(establishment_data) {
      reviewModel.find(reviewSearchQuery).lean().then(function(review_data){
        if (!establishment_data) {
          console.log('Establishment data not found.');
          resp.redirect('/error');
          return;
        }

        //console.log('Establishment Data:', establishment_data);
        //console.log('Review Data: ', review_data);
        resp.render('establishment', {
          layout: 'index',
          title: establishmentName,
          reviewData: review_data,
          establishment: establishment_data,
          currentUser: req.session.username,
          currentUserIcon: req.session.user_icon,
          currentUserType: req.session.userType
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
          user: user_data
        });
      });
    });
    }).catch(errorFn);
  });

  // Helper function to find a user by username
  function getUserByUsername(username) {
    return userData.find(user => user.username === username);
  }

  // POST endpoint for following a user
  router.post('/follow-user', (req, res) => {
    const { username } = req.body;
    const loggedInUsername = req.session.username; // Assuming you have session management middleware

    // Find logged-in user and user to follow
    const loggedInUser = getUserByUsername(loggedInUsername);
    const userToFollow = getUserByUsername(username);

    if (loggedInUser && userToFollow) {
        // Check if user is already followed
        if (!loggedInUser.following.includes(username)) {
            loggedInUser.following.push(username); // Add to following list
            userToFollow.followers.push(loggedInUsername); // Add to followers list
            res.status(200).json({ message: `You are now following ${username}` });
        } else {
            res.status(400).json({ error: `You are already following ${username}` });
        }
    } else {
        res.status(404).json({ error: 'User not found' });
    }
  });

  // POST endpoint for unfollowing a user
  router.post('/unfollow-user', (req, res) => {
    const { username } = req.body;
    const loggedInUsername = req.session.username; // Assuming you have session management middleware

    // Find logged-in user and user to unfollow
    const loggedInUser = getUserByUsername(loggedInUsername);
    const userToUnfollow = getUserByUsername(username);

    if (loggedInUser && userToUnfollow) {
        // Check if user is currently followed
        if (loggedInUser.following.includes(username)) {
            loggedInUser.following = loggedInUser.following.filter(user => user !== username); // Remove from following list
            userToUnfollow.followers = userToUnfollow.followers.filter(user => user !== loggedInUsername); // Remove from followers list
            res.status(200).json({ message: `You have unfollowed ${username}` });
        } else {
            res.status(400).json({ error: `You are not following ${username}` });
        }
    } else {
        res.status(404).json({ error: 'User not found' });
    }
  });

  // update user's information on profile page
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
                return resp.json({success: true, message: 'User updated successfully!'});
            }).catch(function(error) {
                errorFn(error);
                return resp.status(500).json({ success: false, message: 'Failed to update user information' });
            });
        } else {
            return resp.status(404).json({ success: false, message: 'User not found' });
        }
    }).catch(function(error) {
        errorFn(error);
        return resp.status(500).json({ success: false, message: 'Internal Server Error' });
    });
  });

  
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

  // Route to delete a coffee shop review
  router.post('/delete-coffee-shop-review', function(req, res) {
    try {
      console.log('Request body:', req.body); 

      // Retrieve the establishment name from the request body
      const placeName = req.body.establishment_name;
      console.log('Establishment name:', placeName);

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
          const index = user.createdreview.indexOf(placeName);
          if (index !== -1) {
            user.createdreview.splice(index, 1);
            console.log('Ceated review place removed:', placeName);
            return user.save();
          } else {
            // Establishment not found in favorites
            console.log('Establishment not found in favorites.');
            return Promise.reject({ success: false, message: 'Establishment not found in favorites.' });
          }
        })
        .then(function() {
          return res.json({ success: true, message: 'Removed from Created Reviews!' });
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




  return router;
}

module.exports = {
  addRoutes: addRoutes,
};