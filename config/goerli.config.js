require("dotenv").config({ path: __dirname + "./../.env" });
module.exports = {
    "USDC":process.env.GOERLI_USDC,
    "RPC_URL":process.env.GOERLI_URL,
    "FACTORY_ADDRESS":process.env.GOERLI_FACTORY,
    "NETWORK":"goerli",
    "ETHERSCAN_API_KEY":process.env.ETHERSCAN_API_KEY,
    "ACCOUNT_PRIVATE_KEY":process.env.ACCOUNT_PRIVATE_KEY
}