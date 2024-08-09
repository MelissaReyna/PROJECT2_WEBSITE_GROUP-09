// Imports and Initial Setup
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./public/models/User');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Connects to a MongoDB database using Mongoose
// Handles connection errors and confirms successful connection
mongoose.connect('mongodb+srv://test:12345@atlascluster.obgplvb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true
}));

// Set up EJS
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Set the views directory
app.set('views', path.join(__dirname, 'views'));


// ***** ROUTES *****
// Route for the home page
app.get('/', (req, res) => {
  res.render('home', { title: 'Home - B-Fit' });
});

// Route for the login page
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login - B-Fit' });
});

// Route for the sign up page
app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up - B-Fit' });
});

// Route for the exercises page
app.get('/exercises', (req, res) => {
  res.render('exercises', { title: 'Exercises - B-Fit' });
});

// Route for the list page
app.get('/list', (req, res) => {
  res.render('list', { title: 'List - B-Fit' });
});

// Route for the nutrition page
app.get('/nutrition', (req, res) => {
  res.render('nutrition', { title: 'Nutrition - B-Fit' });
});

// Route for the pricing page
app.get('/pricing', (req, res) => {
  res.render('pricing', { title: 'Pricing - B-Fit' });
});

// Route for the strength page
app.get('/strength', (req, res) => {
  res.render('strength', { title: 'Strength - B-Fit' });
});

// Route for the dashboard page with Session Check
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('dashboard', { user: req.session.user, title: 'Dashboard - B-Fit' });
  } else {
    res.redirect('/login');
  }
});

// Sign up
// Hashes the password and creates a new user
// 	Saves the user to the database and sets the session
// 	Redirects to the dashboard on success
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/signup');
  }
});

// Login
// Finds the user by username.
// Compares the provided password with the hashed password.
// Sets the session if the password matches, otherwise redirects to login.
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      console.log(`Attempting login for user: ${username}`); 
      const user = await User.findOne({ username });
      if (user) {
        console.log(`User found: ${username}`); 
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log('Password matched'); 
          req.session.user = user;
          res.redirect('/dashboard');
        } else {
          console.log('Invalid password'); 
          res.redirect('/login');
        }
      } else {
        console.log('Invalid username'); 
        res.redirect('/login');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/login');
    }
  });

// Logout
// Destroys the session and redirects to the home page
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

// Delete account
// Deletes the user from the database
app.post('/delete-account', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.session.user._id });
    req.session.destroy(err => {
      if (err) {
        console.error(err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});

// Update credentials
// Updates the user’s username and/or password
app.post('/update-credentials', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ _id: req.session.user._id });
    if (username) user.username = username;
    if (password) user.password = password;
    await user.save();
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});