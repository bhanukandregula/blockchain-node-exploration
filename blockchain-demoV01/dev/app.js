
// Require the needed dependencies.
const debug = require('debug')('BlockchainExploration: API');
const uuid = require('uuid/v1');

// uuid will have ---- in its string, remove thoese --- and join them.
const nodeAddress = uuid().split('-').join('');
debug("This is the UUID value: ", nodeAddress);

const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// check server with empty router.
app.get('/', function(request, response){
    response.send("Hello Blockchain!");
}); 

// This endpoint will return the entire Block chain.
app.get('/blockchain', function(request, response){
    response.send(bitcoin);
});

// This endpoint is to create a new Transaction
app.post('/transaction', function(request, response){
    const blockIndex = bitcoin.createNewTransaction(request.body.amount, request.body.sender, request.body.recipient);
    response.json({ note: `Transaction will be added in block ${blockIndex}`});
});

// This end point will mine the blockchain, Proof-Of-Work
app.get('/mine', function(request, response){
    const lastBlock = bitcoin.getlastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1,
        nonce: lastBlock['nonce'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    bitcoin.createNewTransaction(12.5, "00", nodeAddress);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
    response.json({ 
        note: "New block mined successfully",
        block: newBlock
    });
});

// configure the PORT and listen to the Express server.
const port = process.argv[2];
app.listen(port, function(request, response){
    debug(`Server is up and running on port ${port}`);
});