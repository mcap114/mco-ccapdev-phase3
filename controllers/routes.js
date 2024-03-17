const express = require('express');
const sessionController = require('./sessionController');
const userModel = require('../models/User');
const reviewModel = require('../models/Review');
const establishmentModel = require('../models/Establishment');

// Define the error handling middleware
const errorHandler = (error, req, resp, next) => {
  console.error('Error:', error);
  resp.status(500).json({ status: 'error', msg: 'An error occurred' });
};

// Define the errorFn function
const errorFn = function (error) {
  console.error('Error:', error);
};

function addRoutes(server) {
  const router = express.Router();

  // route for non-user view homepage
  router.get('/', function (req, resp) {
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
    res.render('registration', {
      layout: 'index',
      title: 'Registration',
    });
  });

  // route for registration page (choosing an avatar)
  router.get('/registrationAvatar', function (req, res) {
    res.render('registrationAvatar', {
      layout: 'index',
      title: 'Registration Avatar',
    })
  });

  // route for creating user in the database
  router.post('/create-user', function(req, resp){
    const userInstance = userModel({
      name: req.body.name,
      username: req.body.username,
      bio: req.body.bio,
      email: req.body.email,
      password: req.body.password,
      confirmpassword: req.body.password2,
      userType: req.body.userType
    });
    
    userInstance.save().then(function(user) {
      console.log('User created');
      resp.json({ success: true, message: 'User created successfully' });
    }).catch(errorFn);
  });

  // route for login page
  router.get('/login', function (req, res) {
    res.render('login', {
      layout: 'index',
      title: 'Login',
    });
  });

  // route for reading user from the database to login
  router.post('/read-user', async function(req, resp){
    try {
      const searchQuery = { username: req.body.username, password: req.body.password };

      const user = await userModel.findOne(searchQuery);

      console.log("\nFinding user: ", req.body.username);

      if (user && user._id) {
        req.session.username = user.username;
        req.session.user_icon = user.user_icon;
        req.session.userType = user.userType;
        console.log("\nUser " , req.session.username , " Found");
        console.log("User Type:", req.session.userType);
        console.log("\n");
        resp.json({success: true});
      } else {
        resp.json({success: false});
      }
    } catch (error) {
      errorFn(error);
      return resp.status(500).json({ status: 'error', msg: 'Internal Server Error' });
    }
  });


  // route for forgot password page
  router.get('/forgotpassword', function (req, res) {
    res.render('forgotpassword', {
      layout: 'index',
      title: 'Forgot Password',
    });
  });

  router.post('/forgot-password', async function(req, resp) {
    try {
        const { username, password } = req.body;

        const user = await userModel.findOne({ username });

        console.log("\nFinding user: ", username);

        if (user) {
            user.password = password; 
            user.confirmpassword = password;
            await user.save();

            console.log("\nPassword updated successfully for user: ", username);

            req.session.username = user.username;
            req.session.user_icon = user.user_icon;
            req.session.userType = user.userType;
            console.log("\nUser " , req.session.username , " Found");
            console.log("User Type:", req.session.userType);
            console.log("\n");
            return resp.json({ success: true, message: 'Password updated successfully' });
        } else {
            console.log("\nUser not found with username: ", username);
            return resp.json({ success: false, message: 'Username not found' });
        }
    } catch (error) {
        errorFn(error);
        return resp.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });

  // route for user view homepage
  router.get('/landingPage', function (req, resp) {
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
    const searchQuery = {};
    console.log('View Establishments');

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
    console.log('Establishment page');
    console.log('Username:', req.session.username);
    
    establishmentModel.findOne(establishmentSearchQuery).lean().then(function(establishment_data) {
      reviewModel.find(reviewSearchQuery).lean().then(function(review_data){
        if (!establishment_data) {
          console.log('Establishment data not found.');
          // Handle the case where establishment_data is not found, redirect or show an error page.
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
          currentUserIcon: req.session.user_icon
        });
      });
    });
  });


  //goofy route, 100% scalable industry-ready
  router.get('/profile/:name', function (req, resp) {
    const userName = req.params.name;
    const searchQuery = { username: userName };
    
  
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
  
        console.log('User Data:', user_data);
        console.log('Establishment Data:', establishment_data);
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

  return router;
}

module.exports = {
  addRoutes: addRoutes,
};


