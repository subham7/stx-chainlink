require("dotenv").config({ path: __dirname + "./../.env" });
module.exports = {
    "USDC":process.env.MAINNET_USDC,
    "RPC_URL":process.env.MAINNET_URL,
    "FACTORY_ADDRESS":process.env.MAINNET_FACTORY,
    "NETWORK":"mainnet",
    "ETHERSCAN_API_KEY":process.env.ETHERSCAN_API_KEY,
    "ACCOUNT_PRIVATE_KEY":process.env.ACCOUNT_PRIVATE_KEY
}