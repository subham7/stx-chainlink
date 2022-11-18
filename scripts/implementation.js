const hre = require("hardhat");
const { exec } = require("child_process");
var Web3 = require('web3');

let config = require("./../config/index");

var web3 = new Web3(config.RPC_URL);


async function main() {
    const NETWORK = config.NETWORK;

    // We get the contract to deploy
    const Instance = await hre.ethers.getContractFactory("ERC20NonTransferable");
    const implementationInstance = await Instance.deploy();

    await implementationInstance.deployed();

    console.log("Implementation Address:- ",implementationInstance.address);

    const factoryInstance = new web3.eth.Contract( require("./../abi/json/FactoryCloneContract.json"),config.FACTORY_ADDRESS);

    var transaction = {
        to:config.FACTORY_ADDRESS,
        value:0,
        data: factoryInstance.methods.changeDAOImplementation(implementationInstance.address).encodeABI(),
        gas:5000000
    }

    const signedTx = await web3.eth.accounts.signTransaction(transaction, process.env.ACCOUNT_PRIVATE_KEY);

    let hash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transaction hash:- ",hash);

    //Verifying Implementation
    exec(`npx hardhat verify --network ${NETWORK} ${implementationInstance.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });