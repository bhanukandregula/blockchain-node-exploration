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

const bc1 = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1544205454819,
            "transactions": [],
            "nonce": 101,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1544205479420,
            "transactions": [],
            "nonce": 102,
            "hash": "ee5ec48634c2e484733beba14f1db769a1633a3886b355975c167c0386aa9ccb",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1544205490414,
            "transactions": [
                {
                    "amount": 12.5,
                    "sender": "00",
                    "recipient": "937316f0fa4911e8a0186f5e3fc31b9c",
                    "transactionId": "a2237730fa4911e8a0186f5e3fc31b9c"
                }
            ],
            "nonce": 103,
            "hash": "55198b28840e62b959b4de0d5d1011839e43248aeb49485ee2327fb5828fc4a5",
            "previousBlockHash": "ee5ec48634c2e484733beba14f1db769a1633a3886b355975c167c0386aa9ccb"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 12.5,
            "sender": "00",
            "recipient": "9372efe0fa4911e89634ab47e9eb1588",
            "transactionId": "a8ac9780fa4911e89634ab47e9eb1588"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": [
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004"
    ]
};

debug("VALID - ", bitcoin.chainIsValid(bc1.chain));