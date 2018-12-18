// Require the dependencies needed.
const Blockchain = require('./blockchain');
const debug = require('debug')('BlockchainExploration: Test');

// Create an instance for the Blockchain constructor function.
const bitcoin = new Blockchain();

// create a new  block, send the params accordingly.
// bitcoin.createNewBlock(3434, 'SMDBSAHD', 'KJAHDAHDKJAS');

// // // create a new transaction.
// bitcoin.createNewTransaction(100, 'ALLYBZCXZBCZMXCZ', 'BHANUNBCZNMBCXZBCZMBCXZ');

// // // create a new  block, send the params accordingly.
//  bitcoin.createNewBlock(4545, 'ANUSMDBSAHD', 'SANJUKJAHDAHDKJAS');

// // create a new transaction.
// bitcoin.createNewTransaction(100, 'ALLYBZCXZBCZMXCZ', 'BHANUNBCZNMBCXZBCZMBCXZ');
// // create a new transaction.
// bitcoin.createNewTransaction(200, 'ALLYBZZBCZMXCZ', 'BHANUNBCZNMBCXZMBCXZ');
// // create a new transaction.
// bitcoin.createNewTransaction(300, 'ALLYBZCXZXCZ', 'BHANUNBCZZBCZMBCXZ');



// // // create a new  block, send the params accordingly.
// bitcoin.createNewBlock(344, 'SMDBSD', 'KJAHDAHDKJASLK');

// const previousBlockHash = 'MNMNNNMN';
// const currentBlockData = [
//     {
//         amount: 10,
//         sender: 'HJHKHKJHKHK',
//         recipient: 'UIYIUYIUYUYI'        
//     },
//     {
//         amount: 50,
//         sender: 'UUYTUYTUTTTYTUTUTUTUY',
//         recipient: 'HHSKAJHSAKJHSKAHSKAHS'        
//     }
// ];
// const nonce = 78678;

// const finalDataHAsh = bitcoin.hashBlock(previousBlockHash, currentBlockData,nonce);

//const dataFromPOW = bitcoin.proofOfWork(previousBlockHash, currentBlockData,nonce);

debug("This is the Data Hash", bitcoin);
//console.log(bitcoin);