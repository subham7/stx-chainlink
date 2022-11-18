const hre = require("hardhat");
const { exec } = require("child_process");
// require("dotenv").config({ path: __dirname + "./../.env" });
var Web3 = require('web3');

var config = require("./../config/index");

var web3 = new Web3(process.env.RINKEBY_URL);

async function main() {
  const USDC_ADDRESS = config.USDC;
  const NETWORK = config.NETWORK;

  // We get the contract to deploy
  const Factory = await hre.ethers.getContractFactory("FactoryCloneContract");
  const factory_instance = await Factory.deploy(USDC_ADDRESS);

  await factory_instance.deployed();

  console.log("Factory deployed to:", factory_instance.address);

  //Verifying factory
  exec(`npx hardhat verify --network ${NETWORK} ${factory_instance.address} "${USDC_ADDRESS}"`,async (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);      
    console.log(error);
  });

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });