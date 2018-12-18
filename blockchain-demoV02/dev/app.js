
// Require the needed dependencies.
const debug = require('debug')('BlockchainExploration: API');
const uuid = require('uuid/v1');
const rp = require('request-promise');

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

// Register a node and broadcast it the network.
app.post('/register-and-broadcast-node', function(request, response){
    // we have to pass the URL of the ride on the request body.
    const newNodeUrl = request.body.newNodeUrl;
    // place new node into blockchain nodes array.
    if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1){
        bitcoin.networkNodes.push(newNodeUrl);
    }

    const regNodePromises = [];

    // Brocadcast the new node to all the other nodes in the network.
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        //register node enpoints.
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        regNodePromises.push(rp(requestOptions)); 
    });

    Promise.all(regNodePromises)
        .then(data => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + '/register-nodes-bulk',
                method: 'POST',
                body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
                json: true
            }

            return rp(bulkRegisterOptions);
        })

        .then(data => {
            response.json({ note: 'New node registered with network successfully!'});
        });

});

// register a node with the network.
app.post('/register-node', function(request, response){
    const newNodeUrl = request.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode){
        bitcoin.networkNodes.push(newNodeUrl);
    }
    response.json({ note: 'new node registered successfully with node.' });
});

// register multiple nodes at once.
app.post('/register-nodes-bulk', function(request, response){
    const allNetworkNodes = request.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        // register current networkNodeUrl to all other nodes.
        if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
    });

    response.json({ node: 'Bulk registration successful' });
});

// configure the PORT and listen to the Express server.
const port = process.argv[2];
app.listen(port, function(request, response){
    debug(`Server is up and running on port ${port}`);
});