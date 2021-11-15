const provier = "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
const etherScanKey = "YOUR_ETHERSCAN_KEY"
const endpoint = "https://api.etherscan.io/api"
const prompt = require('prompt-sync')();
const https = require('https');
const Web3 = require('web3');
let ethPriceUSD = 4500
let web3 = new Web3(provier);
let ens = web3.eth.ens;

let addr = prompt("Enter ETH address or ENS: ")

getEthPrice()

if (addr.includes(".eth")) { // if has .eth
    getENS(addr)
} else {
    getTx(addr)
}

function getENS(addr) {
    console.log("getting ens")
    ens.getAddress(addr)
        .then(address => { getTx(address) })
}

function getTx(addr) {
    let params = {
        "module": "account",
        "address": addr,
        "action": "txlist",
        "apikey": etherScanKey
    }
    get(addParams(endpoint, params), parseData)
    
}

function parseData(data) { // get total gas used and average gas price
    let acc = []
    let totalGasUsed = 0
    let avgGasPrice = 0
    let totalFee = 0
    
    for (tx of data['result']) {
        let gasUsed = parseFloat(tx["gasUsed"])
        let gasPrice = parseFloat(tx["gasPrice"]) / (10**9) // in gewi
        let feeInETH = (gasPrice * gasUsed) / (10**9)
        // console.log(gasUsed, gasPrice, feeInETH)

        totalGasUsed +=  gasUsed
        avgGasPrice += gasPrice
        totalFee += feeInETH
    }

    avgGasPrice /= data['result'].length

    
    displayResult([totalGasUsed, avgGasPrice, totalFee])
}

function displayResult(data) {
    console.log()
    console.log("You have spent a total of " + data[0] + " gas")
    console.log("With an average gas price of " + Math.round(data[1]) + " gwei")
    console.log("That is a total of " + data[2].toFixed(5) + " ETH")
    console.log("With ETHs current price of $" + ethPriceUSD + ",")
    console.log("You have spent a total of $" + (data[2] * ethPriceUSD).toFixed(2) + " on gas")
    console.log()
}

function get(url, callback) {
    let data = ""
    https.get(url, (res) => {
        res.on('data', (d) => {
            data += d
        });
        res.on("end", () => {
            callback(JSON.parse(data))
        })
    }).on('error', (e) => {
        console.error(e);
    });
}

function getEthPrice() {
    params = {
        "module": "stats",
        "action": "ethprice",
        "apikey": etherScanKey
    }
    get(addParams(endpoint, params), (data) => {ethPriceUSD = parseFloat(data['result']['ethusd']).toFixed(2)})
}

function addParams(url, params) {
    url += "?";
    for (const property in params) {
      url += (`${property}=${params[property]}&`);
    }
    url = url.substring(0, url.length - 1);
    // console.log(url)
    return url
}