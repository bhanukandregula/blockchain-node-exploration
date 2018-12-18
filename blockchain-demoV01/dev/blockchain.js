// Require the dependencies needed.
const debug = require('debug')('BlockchainExploration: Blockchain');
const sha256 = require('sha256');

// This is a constructor for Blockchain.
function Blockchain(){
    this.chain = [];
    this.pendingTransactions = [];

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
        recipient: recipient
    };

    // Push the newly created transaction to the pendingTransactions array.
    this.pendingTransactions.push(newTransaction);

    return this.getlastBlock()['index'] + 1;
}

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
}

// Exports the module, so you can use this constructor in other .js files.
module.exports = Blockchain;