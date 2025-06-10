const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const cors = require('cors');

// Set up middleware
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Import your middleware
const { requireLogin } = require('./middleware');

// Import your routes
const routes = require('./routes'); // Assuming you've named your routes file as routes.js

// Use your routes
app.use('/', routes);

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
