const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://Ukc:Kncgreat1@cluster0.7obvlrp.mongodb.net/Hackathon?retryWrites=true&w=majority';
// const mongoURI = 'mongodb://master-node-container:27017/Hackathon';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a generic schema
const GenericSchema = new mongoose.Schema({}, { strict: false });
const HotelRegistrationModel = mongoose.model('HotelRegistrationModel', GenericSchema);

const PORT = 3003;
const url = 'mongodb+srv://Ukc:Kncgreat1@cluster0.7obvlrp.mongodb.net/Hackathon?retryWrites=true&w=majority'; // MongoDB connection URL
const dbName = 'Hackathon'; // Your database name
const collectionName = 'hotelregistrationmodels'; // Your collection name

app.set('view engine', 'ejs'); // Set the view engine to EJS

// Route to render the HTML page
app.get('/', async (req, res) => {
    try {
      const client = await MongoClient.connect(url);
      const db = client.db(dbName);
  
      // Fetch data from MongoDB
      const collection = db.collection(collectionName);
      const data = await collection.find().toArray();
  
      // Get the addressBalance query parameter value
      const addressBalance = req.query.addressBalance;
  
      // Render the HTML and pass data to the template along with addressBalance
      res.render('index', { data, addressBalance });
  
      // Close the MongoDB connection
      client.close();
    } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving data');
    }
  });

  app.get('/:hotelid/hotel/view', async (req, res) => {
    const hotelid = req.params.hotelid;

    const hotel = await HotelRegistrationModel.findById(hotelid);
    if (!hotel) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    res.render('calculate', { hotel });
  });

  /*
  app.get('/:hotelid/hotel', async (req, res) => {
    const hotelid = req.params.hotelid;
  
    const data = await HotelRegistrationModel.findById(hotelid);
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    res.render('calculate', { data });
  });
  */

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
