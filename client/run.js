var server = require('./server'),
  client = require('./scripts/start');

var listenPort = process.argv[2];
var consortiumId = process.argv[3];
var storageAccount = process.argv[4];
var storageAccountKey = process.argv[5];
var containerName = process.argv[6];
var identityBlobPrefix = process.argv[7];
var ethRpcPort = process.argv[8];
var validatorListBlobName = process.argv[9];
var paritySpecBlobName = process.argv[10];
var valSetContractBlobName = process.argv[11];
var adminContractBlobName = process.argv[12];
var adminContractABIBlobName = process.argv[13];
var logFilePath=process.argv[14]
var rpcEndpoint=process.argv[15]

server(listenPort, consortiumId, storageAccount, storageAccountKey, containerName, identityBlobPrefix, ethRpcPort, validatorListBlobName,
    paritySpecBlobName, valSetContractBlobName, adminContractBlobName, adminContractABIBlobName, logFilePath, rpcEndpoint);

client();