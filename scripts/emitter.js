const hre = require("hardhat");
const { exec } = require("child_process");
var Web3 = require('web3');

let config = require("./../config/index");

var web3 = new Web3(config.RPC_URL);


async function main() {
    
    // We get the contract to deploy
    const Instance = await hre.ethers.getContractFactory("Emitter");
    const emitterInstance = await Instance.deploy();

    await emitterInstance.deployed();

    console.log("Emitter Address:- ",emitterInstance.address);

    const factoryInstance = new web3.eth.Contract( require("./../abi/json/FactoryCloneContract.json"),config.FACTORY_ADDRESS);

    let emitterAddress = await factoryInstance.methods.emitterAddress().call();

    let proxyInstance = new web3.eth.Contract( require("./../abi/json/ProxyContract.json"),emitterAddress);

    var transaction = {
        to:emitterAddress,
        value:0,
        data: proxyInstance.methods.upgradeTo(emitterInstance.address).encodeABI(),
        gas:5000000
    }

    const signedTx = await web3.eth.accounts.signTransaction(transaction, process.env.ACCOUNT_PRIVATE_KEY);

    let hash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transaction hash:- ",hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });