const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const request = require('request');
const { Transaction, Contract, HotelBookingUser } = require('./userclass')

// MongoDB connection
const mongoURI = 'mongodb+srv://Ukc:Kncgreat1@cluster0.7obvlrp.mongodb.net/Hackathon?retryWrites=true&w=majority';
// const mongoURI = 'mongodb://master-node-container:27017/Hackathon';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a generic schema
const GenericSchema = new mongoose.Schema({}, { strict: false });
const HotelRegistrationUserGenMod = mongoose.model('HotelRegistrationUserGen', GenericSchema);

// Import your middleware
const { requireLogin } = require('./middleware');

// Sample route 1: Requires login
router.get('/register', requireLogin, (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  var formdata = req.body;
  const user = new HotelBookingUser(formdata.username, formdata.email, formdata.password, formdata.name, formdata.phone, formdata.address);

  try {
    const result = await HotelRegistrationUserGenMod.create(user);
    
    // Assuming 'create' returns the newly created user

    req.session.user = result;

    res.json({
      success: true,
      message: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
});

router.get('/exchange', requireLogin, (req, res) => {
  res.render('exchange');
});

router.get('/login', requireLogin, (req, res) => {
  res.render('login');
});

router.post('/', requireLogin, async (req, res) => {
  res.status(200).json({
    message: "Home"
  })
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  let addressBalance; // Declare addressBalance here

  try {
    // Find the user in the database
    const user = await HotelRegistrationUserGenMod.findById(username);

    if (!user || user.password !== password) {
      return res.status(401).send('Invalid username or password');
    }

    // Set session variable for authentication
    req.session.user = user;

    const addressResponse = await fetch(`http://localhost:3000/address/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (addressResponse.ok) {
      const { addressData } = await addressResponse.json();
      console.log('Address Data:', addressData);

      // Extract addressBalance
      addressBalance = addressData.addressBalance;

      if (user) {
        user.coinholding = addressBalance;
        await user.save();
      } else {
        console.error('User not found during login:', username);
      }
    } else {
      const errorMessage = await addressResponse.text();
      console.error('Error fetching address:', errorMessage);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }

  console.log(`http://localhost:3003/?addressBalance=${addressBalance}`);
  res.redirect(`http://localhost:3003/?addressBalance=${addressBalance}`);
});

router.post('/updatetransactionandholding', requireLogin, async (req, res) => {
  try {
    const userId = req.session.user._id;

    // Fetch the user from the database
    const user = await HotelRegistrationUserGenMod.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = user._id;

    // Extract transaction data from the request body
    const { amount, sender } = req.body;

    const transactionData = {
      amount,
      sender,
      reciever: username
    };

    console.log(`Payment successful! Transaction details: ${JSON.stringify(transactionData)}`);

    const response = await axios.post('http://localhost:3000/transaction', transactionData);

    console.log(`Payment successful! Transaction details: ${JSON.stringify(response.data)}`);

    // Save the updated user document
    await user.save();
  } catch (error) {
    console.error('Error updating transaction and holding:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/hoteltransaction', async (req, res) => {
  try {
    console.log(req.session.user)
    const userId = req.session.user._id;

    // Fetch the user from the database
    const user = await HotelRegistrationUserGenMod.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = user._id;

    const transactionData = req.body; // Contains the data sent from the frontend
    console.log(transactionData);

    const transactionDataFormatted = {
      amount: transactionData.totalAmount,
      sender: username,
      receiver: transactionData.hotelId
    };

    const numberOfRooms = transactionData.numberOfRooms;
    const startDate = transactionData.startDate;
    const endDate = transactionData.endDate;

    const transactionDataFormattedSmart = {
      amount: transactionData.totalAmount,
      sender: username,
      receiver: transactionData.hotelId,
      data: {
        numberOfRooms, startDate, endDate
      }
    };

    // Post to http://localhost:3000/transaction
    fetch('http://localhost:3000/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionDataFormatted)
    })
    .then(response => {
      if (response.ok) {
        // Post to http://localhost:3000/transactionsmart after successful post to /transaction
        return fetch('http://localhost:3000/transactionsmart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactionDataFormattedSmart)
        });
      } else {
        throw new Error('Failed to send formatted data to /transactionsmart.');
      }
    })
    .then(response => {
      if (response.ok) {
        // Handle success for /transactionsmart
        console.log('Data sent to /transactionsmart successfully!');
        res.status(200).json({ message: 'Transaction successful!', data: transactionData });
      } else {
        throw new Error('Failed to send formatted data to /transactionsmart.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred during the transaction.' });
    });

    // Implement logic to process the transaction data (e.g., save to database)
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during the transaction.' });
  }
});

router.get('/transaction', (req, res) => {
  res.render('transaction');
});

/*
router.post('/updatetransactions', async (req, res) => {
  try {
    const userId = req.session.user._id;

    // Fetch the user from the database
    const user = await HotelRegistrationUserGenMod.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract transaction data from the request body
    const { amount, sender } = req.body;

    // Create a new transaction and add it to the user's transactions array
    const transaction = new Transaction(sender, user.username, amount);
    user.transactions.push(transaction);

    // Save the updated user document
    await user.save();

    res.json({ success: true, user, transaction });
  } catch (error) {
    console.error('Error updating user.transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/updatecoinholding', async (req, res) => {
  try {
    const userId = req.session.user._id;

    // Fetch the user from the database
    const user = await HotelRegistrationUserGenMod.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract coinholding data from the request body
    const { amount } = req.body;

    // Update user's holding
    user.holding += amount;

    // Save the updated user document
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating coinholding:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sample route 2: Doesn't require login
router.get('/public', (req, res) => {
  res.render('public');
});

// Sample route 3: Requires login
router.get('/profile', requireLogin, (req, res) => {
  res.render('profile', { user: req.session.user });
});

/updatetransactionandholding
*/



module.exports = router;