const express = require('express');
const bodyParser = require('body-parser');
const bodyparser = require('body-parser');
const app = express();
const path = require('path');
const PORT = 3000;
const mongoose = require('mongoose');
const Blockchain = require('./master_controller_blockchain');
const BlockchainContract = require('./master_controller_contract');
const uuid = require('uuid');


const nodeAddress = uuid.v1().split('-').join("");

const bitcoin = new Blockchain();
const smart = new BlockchainContract();

/*
const rp = require('request');
const requestPromise = require('request');
*/

const cors = require('cors');

let exchangeData = {
  availableCoins: 10000, // Initial number of coins
  conversionRate: 2.5 // 1 Rupee to 1 Swarm
};

app.use(bodyParser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(cors());

// MongoDB connection
const mongoURI = 'mongodb+srv://Ukc:Kncgreat1@cluster0.7obvlrp.mongodb.net/Hackathon?retryWrites=true&w=majority';
// const mongoURI = 'mongodb://master-node-container:27017/Hackathon';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a generic schema
const GenericSchema = new mongoose.Schema({}, { strict: false });
const HotelRegistrationModel = mongoose.model('HotelRegistrationModel', GenericSchema);

const { Location, Contact, RoomType, Service, Policies, HotelRegistration } = require('./master_controller_class')

// Handle POST requests to /hotelRegistration endpoint
app.post('/hotelRegistration', async (req, res) => {
  try{
    var formData = req.body;
    console.log('Received data from frontend:', formData);

    var location = new Location(formData.city, formData.state, formData.country, formData.zipcode);
    var contact = new Contact(formData.email, formData.phone);

    var roomTypes = []
    var number_of_roomTypes = formData.roomTypeCount;
    for(let i = 0; i < number_of_roomTypes; i++) {
      var type = formData[`roomTypes[${i}][type]`];
      var capacity = formData[`roomTypes[${i}][capacity]`];
      var costPerNight = formData[`roomTypes[${i}][costPerNight]`];

      var sample_room = new RoomType(type, capacity, costPerNight);
      roomTypes.push(sample_room);
    }

    var services = []
    var number_of_serviceCount = formData.serviceCount;
    for(let i = 0; i < number_of_serviceCount; i++) {
      var type = formData[`services[${i}][name]`];
      var capacity = formData[`services[${i}][description]`];
      var costPerNight = formData[`services[${i}][cost]`];

      var sample_room = new Service(type, capacity, costPerNight);
      services.push(sample_room);
    }

    var policies = new Policies(formData.checkInTime, formData.checkOutTime, formData.cancellationPolicy);
    var amenities = formData.amenities;
    var hotelRegistration = new HotelRegistration(formData.hotelName, location, contact, roomTypes, services, amenities, policies);

    const result = await HotelRegistrationModel.create(hotelRegistration);

    res.json({
      success: true,
      message: result
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'master_controller_register.html'));
  });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'master_controller_home.html'));
  });

app.get('/gathermaster', async (req, res) => {
  try {
    const documents = await HotelRegistrationModel.find();
    return res.status(20).json(documents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/exchange', (req, res) => {
  return res.json({
    availableCoins: exchangeData.availableCoins,
    conversionRate: exchangeData.conversionRate
  });
});


app.get('/blockchain', (req, res) => {
  res.send(bitcoin);
});

app.get('/blockchainsmart', (req, res) => {
  res.send(smart);
});

app.post('/transaction', (req, res) => {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransaction(newTransaction);
  res.json({
      message: `New Transaction will be added in block ${blockIndex}`
  });
});

app.post('/transactionsmart', (req, res) => {
  const newTransaction = req.body;
  console.log(newTransaction);
  const blockIndex = smart.addTransactionToPendingTransaction(newTransaction);
  res.json({
      message: `New Transaction will be added in block ${blockIndex}`
  });
});

app.use('/images', express.static(path.join(__dirname, 'C:\\Users\\abhin\\OneDrive\\Desktop\\new\\Hackathon\\Master_Node\\images')));

app.get('/mine', (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
      transaction: bitcoin.pendingTrasaction,
      index: lastBlock['index'] + 1,
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  /*
  const registerNodePromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
      const requestOption = {
          uri: networkNodeUrl + '/recieve-new-block',
          method: 'POST',
          body: {
              newBlock: newBlock
          },
          json: true
      };
      registerNodePromises.push(rp(requestOption));
  });
  Promise.all(registerNodePromises)

  .then(data => {
      const registerOption = {
          uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
          method: 'POST',
          body: {
              amount: 12.5,
              sender: "00",
              recipient: nodeAddress
          },
          json: true
      };
      return rp(registerOption);
  })
  .then(data => {
    */
      res.json({
          note: "New Block mined & broadcast Successfully",
          block: newBlock
      });
});

app.get('/minesmart', (req, res) => {
  const lastBlock = smart.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
      transaction: smart.pendingTrasaction,
      index: lastBlock['index'] + 1,
  };
  const nonce = smart.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = smart.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = smart.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    note: "New Block mined & broadcast Successfully",
    block: newBlock
});
});

/*
app.post('/register-and-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    const registerNodePromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {
                newNodeUrl: newNodeUrl
            },
            json: true
        };

        registerNodePromises.push(rp(requestOption));
    });
    Promise.all(registerNodePromises)
    .then(data => {
        const bulkRegisterOption = {
            uri: newNodeUrl + '/register-node-bulk',
            method: 'POST',
            body: {
                allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl]
            },
            json: true
        };
        return rp(bulkRegisterOption);
    })
    .then(data => {
        res.json({
            message: "New node registered"
        });
    })
});

app.post('/register-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    const notCurrntURl = bitcoin.currentNodeUrl !== newNodeUrl;
    if ( (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) && notCurrntURl ) {
        bitcoin.networkNodes.push(newNodeUrl);
        res.json({
            message: "New Network registered"
        });
    }
});

app.post('/register-node-bulk', (req, res) => {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const notCurrntURl = bitcoin.currentNodeUrl !== networkNodeUrl;
        if ( (bitcoin.networkNodes.indexOf(networkNodeUrl) == -1) && notCurrntURl) {
            bitcoin.networkNodes.push(networkNodeUrl);
        }
    });
    res.json({
        message: "Bulk registration successful"
    });
});

app.post('/transaction/broadcast', (req, res) => {
    const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    bitcoin.addTransactionToPendingTransaction(newTransaction);
    const registerNodePromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };
        registerNodePromises.push(rp(requestOption));
    });
    Promise.all(registerNodePromises)
    .then(data => {
       res.json({
        message: 'transaction broadcasted to all nodes'
       });
    })
});

app.post('/recieve-new-block', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash == newBlock.previousBlockHash;
    const correctIndex = (lastBlock['index'] + 1) == newBlock['index'];
    if (correctHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTrasactions = [];
        res.json({
            message: "New block recieved and accepted",
            newBlock: newBlock
        });
    }
    else {
        res.json({
            message: "New block rejected",
            newBlock: newBlock
        });
    }
});
*/

app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = smart.getBlock(blockHash);
  res.json({
      block: correctBlock
  })
})

app.get('/blocksmart/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = smart.getBlock(blockHash);
  res.json({
      block: correctBlock
  })
})

app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
      block: correctBlock
  })
}).getBlock(blockHash);
  res.json({
      block: correctBlock
  })
})

app.get('/blocksmart/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = app.get('/blocksmart/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = smart.getBlock(blockHash);
  res.json({
      block: correctBlock
  })
}).getBlock(blockHash);
  res.json({
      block: correctBlock
  })
})

app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = app.get('/block/:blockHash', (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
      block: correctBlock
  })
}).getBlock(blockHash);
  res.json({
      block: correctBlock
  })
})

app.get('/transactionsearch/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  const transactionData = bitcoin.getTransaction(transactionId);
  res.json({
      transaction: transactionData.transaction,
      block: transactionData.block
  });
});

app.get('/transactionsearchsmart/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;
  const transactionData = smart.getTransaction(transactionId);
  res.json({
      transaction: transactionData.transaction,
      block: transactionData.block
  });
});

app.get('/address/:address' ,(req, res) => {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);
  res.json({
      addressData: addressData
  });
})

app.get('/addresssmart/:address' ,(req, res) => {
  const address = req.params.address;
  const addressData = smart.getAddressData(address);
  res.json({
      addressData: addressData
  });
})

app.listen(PORT, () => {
  console.log(`Master Node backend is running on port ${PORT}`);
});
