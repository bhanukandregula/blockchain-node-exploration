
// npm install body-parser debug express node request request-promise sha256 uuid

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
app.get('/', function (request, response) {
    response.send("Hello Blockchain!");
});

// This endpoint will return the entire Block chain.
app.get('/blockchain', function (request, response) {
    debug("/blockchain api hit.");
    console.log("/blockchain api hit.");
    response.send(bitcoin);
});

// // This endpoint is to create a new Transaction
// app.post('/transaction', function(request, response){
//     const blockIndex = bitcoin.createNewTransaction(request.body.amount, request.body.sender, request.body.recipient);
//     response.json({ note: `Transaction will be added in block ${blockIndex}`});
// });

//create a new transaction
app.post('/transaction', function (request, response) {
    const newTransaction = request.body;
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    response.json({ note: `Transaction will be addess in block ${blockIndex}` });
});

// This will create a transaction and it will broadcast the newly created transaction to all the other nodes in the network.
app.post('/transaction/broadcast', function (request, response) {
    debug("API hit /transaction/broadcast");
    const newTransaction = bitcoin.createNewTransaction(request.body.amount, request.body.sender, request.body.recipient);
    // add the new transaction to oending transactions.
    bitcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    //broadcast this transaction to all other nodes.
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            response.json({ node: 'Transaction created and Broadcasted sucessfully!' });
        });
});

// This end point will mine the blockchain, Proof-Of-Work
app.get('/mine', function (request, response) {
    const lastBlock = bitcoin.getlastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1,
        nonce: lastBlock['nonce'] + 1
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
    //bitcoin.createNewTransaction(12.5, "00", nodeAddress);

    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = [];
    // Going to all the nodes in the network to register the new node,
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: { newBlock: newBlock },
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        .then(data => {
            const requestOptions = {
                uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    amount: 12.5,
                    sender: "00",
                    recipient: nodeAddress
                },
                json: true,
            };

            return rp(requestOptions);
        })

        .then(data => {
            response.json({
                note: "New block mined and broadcasted successfully",
                block: newBlock
            });
        });
});

// This endpoint will registed the new node into the network with all the current active nodes in network.
app.post('/receive-new-block', function(request, response){
    const newBlock = request.body.newBlock;
    debug("New Block value: ", newBlock);
    const lastBlock = bitcoin.getlastBlock();
    debug("This is newBlock", newBlock); 
    // You will use === for yhe comparision and == for equals. :-) 
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    // Check if the newBlock is legitimate - perfect.
    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions= [];
        response.json({ 
            note: 'New Block received and accpeted.',
            newBlock: newBlock
        });
    }else{
        response.json({
            note: 'New Block rejected.',
            newBlock: newBlock
        });
    }
});

// Register a node and broadcast it the network.
app.post('/register-and-broadcast-node', function (request, response) {
    // we have to pass the URL of the ride on the request body.
    const newNodeUrl = request.body.newNodeUrl;
    // place new node into blockchain nodes array.
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
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
                body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
                json: true
            }

            return rp(bulkRegisterOptions);
        })

        .then(data => {
            response.json({ note: 'New node registered with network successfully!' });
        });

});

// register a node with the network.
app.post('/register-node', function (request, response) {
    const newNodeUrl = request.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
        bitcoin.networkNodes.push(newNodeUrl);
    }
    response.json({ note: 'new node registered successfully with node.' });
});

// register multiple nodes at once.
app.post('/register-nodes-bulk', function (request, response) {
    const allNetworkNodes = request.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
        // register current networkNodeUrl to all other nodes.
        if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
    });

    response.json({ node: 'Bulk registration successful' });
});

// Consensus is to vaidate the data in the blockchain network.
app.get('/consensus', function(request, response){

    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
        //this blockchains is an array with all the nodes and transactions details, simply json/ output of the endpoint.
        .then(blockchains => {
            const currentChainLength = bitcoin.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;
              
            blockchains.forEach(blockchain => {
                if(blockchain.chain.length > maxChainLength){
                    maxChainLength = blockchain.chain.length;
                    newLongestChain = blockchain.chain;
                    newPendingTransactions = blockchain.pendingTransactions;
                };
            });

            if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
                response.json({
                    note: 'Current chain has not been replaced',
                    chain: bitcoin.chain
                });
            }else{
                bitcoin.chain = newLongestChain;
                bitcoin.pendingTransactions = newPendingTransactions;
                response.json({
                    note: 'This chain has been replaced.',
                    chain: bitcoin.chain
                });
            }
        })
}); 

// Query our blockchain

// Query from the blockHash
app.get('/block/:blockHash', function(request, response){ 
    // Taking value from the request parameters.
    const blockHash = request.params.blockHash;
    // We are finding for blosk with hash = blockHash. save the value in correctBlock.
    const correctBlock = bitcoin.getBlock(blockHash);
    response.json({
        block: correctBlock
    }); 
}); 

// Query from then transactions.
app.get('/transaction/:transactionId', function(request, response){
    const transactionId = request.params.transactionId;
    // This returns an object, with transaction and Block details.
    const transactionData = bitcoin.getTransaction(transactionId);
    response.json({
        transaction: transactionData.transaction,
        block: transactionData.block
    });
});

// Query from the Address.
app.get('/address/:address', function(request, response){
    const address = request.params.address;
    const addressData = bitcoin.getAddressData(address);
    response.json({
        addressData: addressData
    });
});

app.get('/block-explorer', function(request, response){
    response.sendFile('./block-explorer/index.html', { root: __dirname });
});

// configure the PORT and listen to the Express server.
const port = process.argv[2];
app.listen(port, function (request, response) {
    debug(`Server is up and running on port ${port}`);
});