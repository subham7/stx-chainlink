<h1 align="center">
  	<span>StationX smart contract</span>
</h1>

---

## Info table 

| Contract  | Address | Abi | Link |
| ------------- | ------------- | ------------- | ------------- |
| Factory  | 0x0447748a8916BBe3Df5B66FE55C5eA32e8eC289b  | [abi](abi/json/FactoryCloneContract.json)  | [Link](https://goerli.etherscan.io/address/0x0447748a8916BBe3Df5B66FE55C5eA32e8eC289b) |
| Emitter  | 0x51C61D729f5973b0A89633a331F52299C301FD6c  |  [abi](abi/json/Emitter.json)   | [Link](https://goerli.etherscan.io/address/0x51C61D729f5973b0A89633a331F52299C301FD6c) |
| Implementation  | 0x3875cD6Fb9Baa1D48f788e8b0E696530dCb70093  | [abi](abi/json/ERC20NonTransferable.json)  | [Link](https://goerli.etherscan.io/address/0x3875cD6Fb9Baa1D48f788e8b0E696530dCb70093) |


--- 

## Admin array contract table 

| Contract  | Address | Abi | Link |
| ------------- | ------------- | ------------- | ------------- |
| Factory  | 0xd84Ac23C0Ca46326482fB94C965cE99db9174d08  | [abi](abi/json/FactoryCloneContract.json)  | [Link](https://goerli.etherscan.io/address/0xd84Ac23C0Ca46326482fB94C965cE99db9174d08) |
| Emitter  | 0x0EE5DB6A93670932835bae42c289a7A65d1710e1  |  [abi](abi/json/Emitter.json)   | [Link](https://goerli.etherscan.io/address/0x0EE5DB6A93670932835bae42c289a7A65d1710e1) |

--- 

## Requirement

-   Install nvm(Node version manager) by using command
    ```sh
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash

    OR 

    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

    ```

-  Run this commands to configure
    ```sh

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    ```
-  Confirm it is installed properly

    ```sh
    nvm --version
    ```
-   Installing Nodejs
    ```sh
    nvm install 16.13.1
    ```

## Installation


-   install all modules

    ```sh
    npm install --save
    ```

    ```sh
    yarn
    ```
## Create .env

- Add etherscan and account private key in .env
  
    ```sh
    ## Network where to deploy contracts
    NETWORK="goerli"
    
    ## Account private keys
    ETHERSCAN_API_KEY=""
    ACCOUNT_PRIVATE_KEY=""
    
    ## Rinkeby config 
    RINKEBY_URL=""
    RINKEBY_FACTORY="0xb08FEEa8Ea1E791ecdF7Ba1FD52e31C0498F4ca0"
    RINKEBY_USDC="0xc5BF7c0A304DcAC35D3d58e1fB3Ee4aBd4A8629b"
    
    ## Goerli config
    GOERLI_URL=""
    GOERLI_FACTORY="0x0447748a8916BBe3Df5B66FE55C5eA32e8eC289b"
    GOERLI_USDC="0xf699d5f8F3C0E6Ad4e239685e7B5F141CF1a0CC1"
    
    ## Mainnet config
    MAINNET_URL=""
    MAINNET_FACTORY=""
    MAINNET_USDC=""
    ```

## Commands

- Compile

    ```sh
    yarn compile
    ```

- Generate ABI

    ```sh
    yarn abi
    ```

- Deploy

    ```sh
    yarn deploy
    ```

- Change Implementation
  - Perquisite is to have factory contract in .env
    ```sh
    yarn implementation
    ```

- Change Emitter
  - Perquisite is to have factory contract in .env
    ```sh
    yarn emitter
    ```
