require("dotenv").config({ path: __dirname + "./../.env" });
module.exports = {
    "USDC":process.env.RINKEBY_USDC,
    "RPC_URL":process.env.RINKEBY_URL,
    "FACTORY_ADDRESS":process.env.RINKEBY_FACTORY,
    "NETWORK":"rinkeby",
    "ETHERSCAN_API_KEY":process.env.ETHERSCAN_API_KEY
}