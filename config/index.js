require("dotenv").config({ path: __dirname + "./../.env" });
const RINKEBY_CONFIG = require("./rinkeby.config");
const GOERLI_CONFIG = require("./goerli.config");

var EXPORT_CONFIG;

if(process.env.NETWORK == "rinkeby"){
    EXPORT_CONFIG = RINKEBY_CONFIG;
}
else if(process.env.NETWORK == "goerli"){
    EXPORT_CONFIG = GOERLI_CONFIG;
}
else{
    EXPORT_CONFIG = {};
}

module.exports =EXPORT_CONFIG;