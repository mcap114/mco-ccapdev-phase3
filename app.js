// command prompt (node js)
// npm init
// npm i express express-handlebars body-parser mongoose express-session bcrypt
// node app.js -- after, check the browser --> localhost:3000

// command prompt (git)
// git pull
// git add .
// git commit -m "message"
// git push origin main

// express
const express = require('express');
const server = express();

// bodyparser
const bodyParser = require('body-parser');
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// handlebars
const handlebars = require('express-handlebars');

server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
  extname: 'hbs',
  helpers: {
    // helper to compare two values
    eq: function (arg1, arg2) {
      // pang debug lang
      console.log('arg1:', arg1);
      console.log('arg2:', arg2);

      // compare
      const result = arg1 === arg2;

      // check if true or false yung pag compare
      console.log('Comparison result:', result);

      return result;
  }
},
}));


// manage user sessions
const session = require('./controllers/sessionController');
server.use(session);

// routes
const routes = require('./controllers/routes');
server.use('/', routes.addRoutes(server));

// public folder
server.use(express.static('public'));

// mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cofeedDB');

mongoose.connection.on('connected', () => {
  console.log('\nDatabase connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
});

// database models
const userModel = require('./models/User');
const reviewModel = require('./models/Review');
const establishmentModel = require('./models/Establishment');

// hashing passwords
const bcrypt = require('bcrypt');
function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// loading json files into the db
const fs = require('fs');
const path = require('path');
const modelsFolder = path.join(__dirname, 'models');

function importJSONFilesToDB() {
  try {
    const files = fs.readdirSync(modelsFolder);
    const promises = files.map((file) => {
      if (file.endsWith('.json')) {
        const filePath = path.join(modelsFolder, file);
        const data = require(filePath); 
        let model;
        if (file.startsWith('user')) {
          data.forEach((user) => {
            user.password = hashPassword(user.password);
          });
          model = userModel;
        } else if (file.startsWith('review')) {
          model = reviewModel;
        } else if (file.startsWith('establishment')) {
          model = establishmentModel;
        }

        return model.find().then(existingData => {
          const newData = data.filter(newItem => 
            !existingData.some(existingItem => 
              JSON.stringify(existingItem) === JSON.stringify(newItem)
            )
          );

          if (newData.length > 0) {
            return model.create(newData).then(() => {
              console.log(`Data from ${file} imported successfully.`);
            });
          } else {
            console.log(`No new data to import from ${file}.`);
          }
        });
      }
    });

    Promise.all(promises).then(() => {
      console.log('\nAll JSON files imported successfully.');
    }).catch((err) => {
      console.error('Error importing JSON files:', err);
    });
  } catch (err) {
    console.error('Error reading models folder:', err);
  }
}


importJSONFilesToDB();

// error handling
function errorFn(err) {
  console.log('Error found. Please trace!');
  console.error(err);
}

// closing the database
function finalClose() {
  console.log('\nClose connection at the end!');
  mongoose.connection.close();
  process.exit();
}

process.on('SIGTERM', finalClose);  //general termination signal
process.on('SIGINT', finalClose);   //catches when ctrl + c is used
process.on('SIGQUIT', finalClose); //catches other termination commands

const port = process.env.PORT | 3000;
server.listen(port, function () {
  console.log('\nListening at port ' + port);
});
