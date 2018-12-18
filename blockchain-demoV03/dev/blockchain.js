// Require the dependencies needed.
const debug = require('debug')('BlockchainExploration: Blockchain');
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

// This is a constructor for Blockchain.
// Genesis block.
function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    // This is to let the blockchain knew, about rest of the nodes available in the network.
    this.networkNodes = [];
    // => Genesis Block = Geneisis is the first Block in a Block Chain.
    // => So we will make sure. Genesis will create automatically along with the constructor.
    this.createNewBlock(101, '0', '0');
}

// Place a method on our blockchain.
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
    // New Block configuration.
    // Check out the Block diagram for ribust understandng.
    const newBlock = {
        // Index is - what number block.
        index: this.chain.length +1,
        // This is, when the block is created.
        timestamp: Date.now(),
        // Adding the transactions to our block, so they never change.
        transactions: this.pendingTransactions,
        // This is a changable value in a block, this comes from Proof of Work and this is just a number.
        nonce: nonce,
        // This is the data - hash value of the block - SHA256, which is unique.
        hash: hash,
        // This is the hash value of the preceding block hash.
        previousBlockHash: previousBlockHash
    };

    // Empty the Transactions Array, so we can use the array for next new block while we create.
    this.pendingTransactions = [];

    // Push the newBlock object value to the Blockchain - chain array.
    this.chain.push(newBlock);
  
    return newBlock;
}

// This is a function to get the lastBlock.
Blockchain.prototype.getlastBlock = function(){
    // This returns last vlaue of the chain array.
    return this.chain[this.chain.length -1];
}

// This is a funtion to create a new Transactions.
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
    // create a object to create a new transaction.
    const newTransaction = {
        // Amount to send.
        amount: amount,
        // Sender details, to send amount.
        sender: sender,
        // Recipient details to receive the amount.
        recipient: recipient,
        transactionId: uuid().split('-').join('')
    };

    return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObject){
    this.pendingTransactions.push(transactionObject);
    return this.getlastBlock()['index'] + 1;
};

// This is a function to hash - SHA266 the data inside the Block.
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){
    // change all the pieces of Data into a single String.
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
}

// This is a function for Proof Of Work - Consensus Protocol.
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    // => repeatedly hash block until it finds the correct hash.
    // => uses current block data for the Hash and also the previousBlockHash
    // => Continously changes nonce value until it finds the correct Hash.
    // => Returns to us the nonce value that creates the correct hash

    // Define a nonce.
    let nonce = currentBlockData.nonce;

    // Hash all the data for the first time. 
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain){

    let validChain = true;

    // checkout the previous hash of the current block is equals to the hash of the previous block.
    for(var i = 1; i < blockchain.length; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i -1];

        const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
        
        debug("PreviousBlockHash", prevBlock['hash']);
        debug(" CurrentBlockHash", currentBlock['hash']);
  
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 101;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

    return validChain;
};

// This method will help us to get the block details - we will find it from specific BlockHash - the details.
Blockchain.prototype.getBlock = function(blockHash){
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash) correctBlock = block;
    });
    return correctBlock;
};

// This method will help us to get the block details - we will find it from specific transactionId - the details.
Blockchain.prototype.getTransaction = function(transactionId){
    let correctTransaction = null;
    let correctBlock = null;

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.transactionId === transactionId){
                correctTransaction = transaction;
                correctBlock = block;
            }
        });
    });

    return {
        transaction: correctTransaction,
        block: correctBlock
    }
};

Blockchain.prototype.getAddressData = function(address){
    const addressTransactions = [];
    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if(transaction.sender === address || transaction.recipient === address){
                addressTransactions.push(transaction);
            };
        });
    });

    let balance = 0;
    addressTransactions.forEach(transaction => {
        if(transaction.recipient === address) balance+= transaction.amount;
        else if(transaction.sender === address) balance -= transaction.amount;
    });

    return {
        addressTransactions: addressTransactions,
        addressBalance: balance
    }
};

// Exports the module, so you can use this constructor in other .js files.
module.exports = Blockchain;