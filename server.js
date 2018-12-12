var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var util = require('util');
var Web3 = require('web3');
var moment = require('moment');
var Promise = require('promise');
var storage = require('azure-storage');
var appjson = require('./version.json')

/*
 * Parameters
 */
var listenPort = process.argv[2];
var consortiumId = process.argv[3];
process.env['AZURE_STORAGE_ACCOUNT'] = process.argv[4];
process.env['AZURE_STORAGE_ACCESS_KEY'] = process.argv[5];
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

/*
 * Constants
 */
const refreshIntervalInMs = 10000;
const nodeRegexExp = /enode:\/\/\w{128}\@(\d+.\d+.\d+.\d+)\:\d+$/;
var blobService = storage.createBlobService();
const recentBlockDecrement = 10; // To find a recent block for "/networkInfo", take the "currentBlock - recentBlockDecrement"

var app = express();

app.use(express.static('public'));
app.use(express.static('share'));
app.use('/assets', express.static('assets'))
app.use(bodyParser.urlencoded({
  extended: true
}));

var activeNodes = [];
var abiContent = '';
var timeStamp;
var addressList = undefined;

process.on('uncaughtException', err => {
  if (err.message.includes("ECONNRESET")) {
    console.log(err);
  } else throw err;
});
process.on('unhandledRejection', err => {
  if (err.message.includes("ECONNRESET")) {
    console.log(err);
  } else throw err;
});

// Set logging
var log_file = fs.createWriteStream(logFilePath, {
  flags: 'a'
});
var log_stdout = process.stdout;

console.log = function (d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

/*
 * Output Parameters to log file
 */
console.log("server.js starting parameters")
console.log(`listenPort: ${listenPort}`)
console.log(`consortiumId: ${consortiumId}`)
console.log(`containerName: ${containerName}`)
console.log(`identityBlobPrefix: ${identityBlobPrefix}`)
console.log(`ethRpcPort: ${ethRpcPort}`)
console.log(`validatorListBlobName: ${validatorListBlobName}`)
console.log(`paritySpecBlobName: ${paritySpecBlobName}`)
console.log(`valSetContractBlobName: ${valSetContractBlobName}`)
console.log(`adminContractBlobName: ${adminContractBlobName}`)
console.log(`adminContractABIBlobName: ${adminContractABIBlobName}`)
console.log(`logFilePath: ${logFilePath}`)
console.log(`rpcEndpoint: ${rpcEndpoint}`)
console.log(`Started EtherAdmin website - Ver.${appjson.version}`);


function getRecentBlock() {
  return new Promise(function (resolve, reject) {
    try {
      var web3RPC = new Web3(new Web3.providers.HttpProvider(rpcEndpoint));
    } catch (err) {
      console.log(err);
    }
    var latestBlockNumber = web3RPC.eth.blockNumber;
    var recentBlockNumber = Math.max(latestBlockNumber - recentBlockDecrement, 1);

    web3RPC.eth.getBlock(recentBlockNumber, function (error, result) {
      if (!error) {
        resolve(result);
      } else {
        reject('Unable to get a recent block');
      }
    })
  });
}


/*
 * Given a node hostinfo object, collect node information (Consortium Id, PeerCount, Latest Block #)
 */
function getNodeInfo(hostinfo, ipAddress) {
  return new Promise(function (resolve, reject) {
    try {
      var web3RPC = new Web3(new Web3.providers.HttpProvider('http://' + ipAddress + ':' + ethRpcPort));
    } catch (err) {
      console.log(err);
    }
    var web3PromiseArray = [];
    web3PromiseArray.push(new Promise(function (resolve, reject) {
      web3RPC.net.getPeerCount(function (error, result) {
        if (!error) {
          resolve(result);
        } else {
          resolve('Not running');
        }
      })
    }));
    web3PromiseArray.push(new Promise(function (resolve, reject) {
      web3RPC.eth.getBlockNumber(function (error, result) {
        if (!error) {
          resolve(result);
        } else {
          resolve('Not running');
        }
      })
    }));
    Promise.all(web3PromiseArray).then(function (values) {
      var peerCount = values[0];
      var blockNumber = values[1];
      var nodeInfo = {
        hostname: hostinfo.hostname,
        address: hostinfo.nodeAddress,
        region: hostinfo.region,
        peercount: peerCount,
        blocknumber: blockNumber,
        consortiumid: consortiumId,
        enodeUrl: hostinfo.enodeUrl
      }
      resolve(nodeInfo);
    });
  });
}

function getAddressListExists() {
  return new Promise((resolve, reject) => {
    blobService.doesBlobExist(containerName, validatorListBlobName, function (err, result) {
      if (err) {
        console.log(`Error trying to determine if ${validatorListBlobName} exists in ${containerName}`);
        console.error(err);
        reject(err);
      } else {
        resolve(result.exists);
      }
    })
  })
}

function getAddressListContents() {
  return new Promise((resolve, reject) => {
    getAddressListExists()
      .then(function (exists) {
        if (exists) {
          console.log(`${validatorListBlobName} file exists.`);

          var addressListPromise = new Promise((resolve, reject) => {
            blobService.getBlobToText(
              containerName,
              validatorListBlobName,
              function (err, blobText, blockBlob) {
                if (err) {
                  reject(err);
                } else {
                  console.log(`${validatorListBlobName} contents: ${blobText}`)
                  var addressListObject = JSON.parse(blobText);
                  resolve(addressListObject)
                }
              }
            )
          });
          addressListPromise.then((result) => {
            resolve(result);
          });
        } else {
          resolve(null);
        }
      });
  });
}

function getBlobs(continuationToken) {
  if (typeof continuationToken == "undefined") {
    continuationToken = null;
  }
  return new Promise((resolve, reject) => {
    var allBlobs = [];
    blobService.listBlobsSegmentedWithPrefix(containerName, identityBlobPrefix, continuationToken, function (err, result) {
      if (err) {
        console.log(`Couldn't list blobs for container: ${containerName}`);
        console.error(err);
        reject(err);
      } else {
        result.entries.forEach((eachEntry) => allBlobs.push(eachEntry))
        if (result.continuationToken) {
          getBlobs(result.continuationToken).then((moreEntries) => {
            moreEntries.forEach((eachEntry) => allBlobs.push(eachEntry))
            resolve(allBlobs);
          })
        } else {
          resolve(allBlobs);
        }
      }
    })
  })
}

function getLeasedBlobList(listBlobs) {
  var promise = new Promise((resolve, reject) => {
    var properties = [];
    listBlobs.forEach((blob) => {
      properties.push(new Promise((resolve, reject) => {
        blobService.getBlobProperties(containerName, blob.name, null, function (err, result) {
          if (err) {
            console.log(`Couldn't get properties for the blob : ${blob.name}`);
            console.error(err);
            reject(err);
          } else {
            resolve({
              name: blob.name,
              state: result.lease.state
            });
          }
        })
      }))
    })
    Promise.all(properties).then(function (values) {
      if (values.length == 0) {
        resolve();
      } else {
        var result = values.filter(value => value.state == 'leased');
        resolve(result);
      }
    })
  })
  return promise;
}

function getAbiDatafromBlob() {
  var abiPromise = new Promise((resolve, reject) => {
    // Get adminContractABIBlobName
    blobService.getBlobToText(
      containerName,
      adminContractABIBlobName,
      function (err, blobContent, blob) {
        if (err) {
          reject(err);
        } else {
          resolve(blobContent)
        }
      }
    )
  });
  abiPromise.then(function (contents) {
    abiContent = contents;
  });
}

function getActiveNodeDetails(leasedList) {
  var nodePromiseArray = [];
  var promise = new Promise((resolve, reject) => {
    if (leasedList.length == 0) {
      // No list
      resolve([]);
    }

    leasedList.forEach((value) => {
      nodePromiseArray.push(
        new Promise(function (resolve, reject) {
          blobService.getBlobToText(
            containerName,
            value.name,
            function (err, blobContent, blob) {
              if (err) {
                console.log(err);
                reject(err);
              } else {
                var nodeValue = JSON.parse(blobContent);
                if (typeof nodeValue.enodeUrl == 'undefined') {
                  console.error(`Error undefined`);
                  resolve();
                } else {
                  var result = nodeValue.enodeUrl.match(nodeRegexExp);
                  if (nodeValue.hostname == '' || result.length != 2) {
                    console.error(`Unable to parse hostname:${nodeValue.hostname} or IpAddress from the blob`);
                    resolve();
                  } else if (nodeValue.nodeAddress == '') {
                    console.error(`Unable to parse node address:${nodeValue.nodeAddress} from the blob`);
                    resolve();
                  } else if (nodeValue.region == '') {
                    console.error(`Unable to parse node region:${nodeValue.region} from the blob`);
                    resolve();
                  } else {
                    resolve(getNodeInfo(nodeValue, result[1]));
                  }
                }
              }
            })
        }))
    });
    Promise.all(nodePromiseArray).then(function (values) {
      if (values.length == 0) {
        resolve("No Values");
      }
      timeStamp = moment().format('h:mm:ss A UTC,  MMM Do YYYY');
      var resultSet = values.sort();
      resolve(resultSet);
    });
  })
  return promise
}

function getNodesfromBlob() {
  // Get Node info
  getBlobs()
    .then(getLeasedBlobList)
    .then(getActiveNodeDetails).catch(function (error) {
      console.log(`Error occurs while getting node details : ${error}`);
    })
    .then(function (activeNodesList) {
      activeNodes = activeNodesList;
    });
}

console.log('Start EtherAdmin Site');
setInterval(getNodesfromBlob, refreshIntervalInMs);
getAbiDatafromBlob();
getAddressListContents().then((result) => {
  if (result) {
    console.log(`getAddressListContents() returns: ${JSON.stringify(result)}`);
    addressList = result;
  } else {
    console.log(`${validatorListBlobName} does not exist`);
  }
});

app.get('/getNodes', function (req, res) {
  var hasNodeRows = activeNodes.length > 0;
  console.log(hasNodeRows, 'HAS NODE ROWS')
  if (hasNodeRows) {
    var data = {
      hasNodeRows: hasNodeRows,
      consortiumid: consortiumId,
      nodeRows: activeNodes,
      timestamp: timeStamp,
      refreshinterval: (refreshIntervalInMs / 1000),
      contractAbi: abiContent,
      rpcEndpoint: rpcEndpoint
    };
    res.send({ data });
  } else {
    console.log("no active nodes");
    res.send({ data: 'Loading'});
  }
});

// Get:networkinfo
app.get('/networkinfo', function (req, res) {
  var networkInfo = new NetworkInfo();
  networkInfo.adminContractABI = abiContent;
  if (addressList)
    networkInfo.addressList = addressList;
  // Get Node info
  getBlobs()
    .then(getLeasedBlobList)
    .then(getActiveNodeDetails).catch(function (error) {
      console.log(`Error occurs while getting node details : ${error}`);
      networkInfo.errorMessage += error + "\n";
    })
    .then(function (activeNodesList) {
      if (activeNodesList.length > 0) {
        activeNodesList.forEach((nodeInfo) => {
          networkInfo.bootnodes.push(nodeInfo.enodeUrl);
          var nodeMetadata = new NodeMetadata();
          nodeMetadata.enodeUrl = nodeInfo.enodeUrl;
          nodeMetadata.hostname = nodeInfo.hostname;
          nodeMetadata.address = nodeInfo.address;
          nodeMetadata.region = nodeInfo.region;
          networkInfo.nodeMetadata.push(nodeMetadata);
        });

      } else {
        networkInfo.errorMessage += "Couldn't find any active nodes\n";
      }
    })
    .then(getRecentBlock)
    .then(function (recentBlock) {
      // Get paritySpecBlobName
      networkInfo.recentBlock = recentBlock;
      blobService.getBlobToText(
        containerName,
        paritySpecBlobName,
        function (err, blobContent, blob) {
          if (err) {
            console.log(err);
            networkInfo.errorMessage += err + "\n";
            res.send(JSON.stringify(networkInfo));
          } else {
            networkInfo.paritySpec = blobContent;

            // Get valSetContractBlobName
            blobService.getBlobToText(
              containerName,
              valSetContractBlobName,
              function (err, blobContent, blob) {
                if (err) {
                  console.log(err);
                  networkInfo.errorMessage += err + "\n";
                  res.send(JSON.stringify(networkInfo));
                } else {
                  networkInfo.valSetContract = blobContent;

                  // Get adminContractBlobName
                  blobService.getBlobToText(
                    containerName,
                    adminContractBlobName,
                    function (err, blobContent, blob) {
                      if (err) {
                        console.log(err);
                        networkInfo.errorMessage += err + "\n";
                        res.send(JSON.stringify(networkInfo));
                      } else {
                        networkInfo.adminContract = blobContent;
                        res.send(JSON.stringify(networkInfo));
                      }
                    });
                }
              });
          }
        }).catch(function (error) {
        console.log(`Error Occurred : ${error}`);
      });
    })
})

app.get('/selectValidators/:maxValidators', function (req, res) {
  getBlobs()
  .then(getLeasedBlobList)
  .then(getActiveNodeDetails).catch(function (error) {
    res.status(500).send(`An error occured while getting node details: ${error}`);
  })
  .then(function (activeNodesList) {
    if (activeNodesList.length > 0) {
      // Sort for the sake of purity
      activeNodesList.sort(function(a,b) { return b.address - a.address});
      const maxValidators = parseInt(req.params.maxValidators);
      let addresses = [];

      if (activeNodesList.length > maxValidators) {
        const nodesByRegion = activeNodesList.reduce((acc, node) => {
          const region = node.region;
          acc[region] = acc[region] || [];
          acc[region].push(node);
          return acc;
        }, {});

        // Take a node from each region until we've reached the maximum allowable nodes
        const regions = Object.keys(nodesByRegion);
        for(var i = 0; i < maxValidators; i++) {
          const regionIndex = i % regions.length;
          const nodeIndex = Math.floor(i / regions.length);
          const node = nodesByRegion[regions[regionIndex]][nodeIndex];
          if (node) {
            addresses.push(node.address);
          }
        }
      } else {
        addresses = activeNodesList.map(n => n.address);
      }

      res.send(addresses);
    }

    res.status(400).send('No active nodes could be found.');
  });
});

// Used for sharing information about the network to joining members
function NetworkInfo() {
  // Indicates break in compatibility
  this.majorVersion = 0;
  // Indicates backward compatible change
  this.minorVersion = 1;
  this.bootnodes = [];
  this.nodeMetadata = [];
  this.valSetContract = "";
  this.adminContract = "";
  this.adminContractABI = "";
  this.paritySpec = "";
  this.errorMessage = "";
  this.recentBlock = "";
}

function NodeMetadata() {
  this.enodeUrl = "";
  this.hostname = "";
  this.address = "";
}

app.get('/validatorContract.js', function (req, res) {
  var file = __dirname + '/validatorContract.js';
  res.download(file);
});

app.listen(listenPort, function () {
  console.log('Admin webserver listening on port ' + listenPort);
});