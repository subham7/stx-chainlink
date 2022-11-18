// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract USDC is ERC20, Ownable {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }

    function decimals() override public pure returns (uint8) {
        return 6;
    }

    function mint(address _address,uint256 _amount) public {
        _mint(_address, _amount * 10 ** decimals());
    } 
}  