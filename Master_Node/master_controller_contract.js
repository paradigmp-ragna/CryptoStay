const { stringify } = require('querystring');
const sha256 = require('sha256')
//const currentNodeUrl = process.argv[3];
const uuid = require('uuid');
const bodyparser = require('body-parser');

function Blockchain() {
    this.chain = [];
    this.pendingTrasactions = [];

    // this.currentNodeUrl = currentNodeUrl;
    // this.networkNodes = [];

    this.createNewBlock(103292, '0', '0');
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        trasactions: this.pendingTrasactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
    };

    this.pendingTrasactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient, data) {
    const newTransaction = {
        data: data,
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: uuid.v1().split('-').join("")
    };

    return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransaction = function(transactionObj) {
    this.pendingTrasactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
}

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString)
    return hash;
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) != '0000') {
        nonce += 1;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    };

    return nonce;
}

Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true;
    console.log(blockchain.length);

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
        const currentBlockData = {
            transaction: currentBlock['trasactions'],
            index: currentBlock['index'],
        };
        console.log('current block => ' + currentBlock['previousBlockHash']);
        console.log('Previous Block Hash => ' + prevBlock['hash']);
		const blockHash = this.hashBlock(prevBlock['hash'], currentBlockData, currentBlock["nonce"]);
        /*
		if (blockHash.substring(0, 4) !== '0000') {
            console.log(blockHash);
            validChain = false;
        }
        */
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) {
            console.log("Hash error");
            validChain = false;
        }
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 103292;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['trasactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
        console.log(correctNonce);
        console.log(correctPreviousBlockHash);
        console.log(correctHash);
        console.log(correctTransactions);
        console.log("genesis error");
        validChain = false;
    }
	return validChain;
}

Blockchain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.hash === blockHash) {
            correctBlock = block;
        }
    })
    return correctBlock;
}

Blockchain.prototype.getTransaction = function(transactionId) {
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(block => {
        block.trasactions.forEach(transaction => {
                    if (transaction.transactionId == transactionId) {
                        correctTransaction = transaction;
                        correctBlock = block;
                    }
                })
            })
    return {
        transaction: correctTransaction,
        block: correctBlock
    };
};

Blockchain.prototype.getAddressData = function(address) {
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.trasactions.forEach(transaction => {
            if (transaction.sender === address || transaction.recipient === address) {
                addressTransactions.push(transaction);
            }
        });
    });
    let balance = 0;
    addressTransactions.forEach(transaction => {
        if (transaction.recipient === address) {
            balance += transaction.amount;
        }
        else if (transaction.sender === address) {
            balance -= transaction.amount;
        }
    })
    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    }
}

module.exports = Blockchain;