// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {AutomationRegistryInterface, State, Config} from "@chainlink/contracts/src/v0.8/interfaces/AutomationRegistryInterface1_2.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface KeeperRegistrarInterface {
  function register(
    string memory name,
    bytes calldata encryptedEmail,
    address upkeepContract,
    uint32 gasLimit,
    address adminAddress,
    bytes calldata checkData,
    uint96 amount,
    uint8 source,
    address sender
  ) external;
}

contract Registrar {
  
  

  using Counters for Counters.Counter;
  Counters.Counter private countAirdrops;

  struct AirDrop {
    address tokenAddress;
    address[] members;
    uint256[] amount;
    uint256 executionTime;
    bool executionStatus;
  }

  mapping(uint256=>AirDrop) public Tokens;
  mapping(uint256=>uint256) public KeeperAssociatedId;

  LinkTokenInterface public immutable i_link;
  address public immutable registrar;
  AutomationRegistryInterface public immutable i_registry;
  bytes4 registerSig = KeeperRegistrarInterface.register.selector;

  constructor(
    LinkTokenInterface _link,
    address _registrar,
    AutomationRegistryInterface _registry
  ) {
    // 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
    i_link = _link;
    // Registrar Address	0x9806cf6fBc89aBF286e8140C42174B94836e36F2
    registrar = _registrar;
    // Registry Address	0x02777053d6764996e594c3E88AF1D58D5363a2e6
    i_registry = _registry;
  }

  function getCounter() internal returns(uint256){
    uint256 _currentId = countAirdrops.current();
    countAirdrops.increment();
    return _currentId;
  }

  function currentTimestamp() external view returns(uint256){
    return block.timestamp;
  }

  function registerAirdrop(
    string memory name,
    address [] memory _users,
    uint256 [] memory _amount,
    address _tokenAddress,
    uint256 _executionTime,
    uint256 _gas
  ) public {
    require(_tokenAddress != address(0),"Invalid Token");
    require(_users.length > 0,"Invalid Parameters");
    require(_users.length == _amount.length,"Invalid Parameters");
    require(_executionTime > block.timestamp,"Invalid Parameters");

    uint256 _totalAmount = 0;
    for(uint8 i=0;i<_amount.length;i++){
      _totalAmount += _amount[i];
    }

    require(_totalAmount > 0,"Invalid Parameters");

    IERC20(_tokenAddress).transferFrom(msg.sender,address(this),_totalAmount);

    AirDrop memory _temp = AirDrop({tokenAddress:_tokenAddress,members:_users,amount:_amount,executionTime:_executionTime,executionStatus:false});

    uint256 _curreentId = getCounter();

    Tokens[_curreentId] = _temp;

    (State memory state, Config memory _c, address[] memory _k) = i_registry.getState();
    uint256 oldNonce = state.nonce;
    bytes memory checkData = abi.encodePacked(_curreentId);
    bytes memory payload = abi.encode(
      name,
      '0x',
      address(this),
      _gas,
      address(msg.sender),
      checkData,
      5*(10**18),
      0,
      address(this)
    );
    
    i_link.transferAndCall(registrar, 5*(10**18), bytes.concat(registerSig, payload));
    (state, _c, _k) = i_registry.getState();
    uint256 newNonce = state.nonce;
    if (newNonce == oldNonce + 1) {
      uint256 upkeepID = uint256(
        keccak256(abi.encodePacked(blockhash(block.number - 1), address(i_registry), uint32(oldNonce)))
      );
      KeeperAssociatedId[_curreentId] = upkeepID;
    } else {
      revert("auto-approve disabled");
    }
  }

  function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData) {
    uint256 counterData = abi.decode(checkData,(uint256));
    AirDrop memory _AirdropData = Tokens[counterData];

    upkeepNeeded = block.timestamp > _AirdropData.executionTime;    
    performData = checkData;    
  }

  function performUpkeep(bytes calldata performData) external {
    uint256 counterData = abi.decode(performData,(uint256));
    AirDrop memory _AirdropData = Tokens[counterData];

    if(_AirdropData.executionTime < block.timestamp && _AirdropData.executionStatus == false){
      Tokens[counterData].executionStatus = true;
      address[] memory members = _AirdropData.members;
      uint256 [] memory amount = _AirdropData.amount;

      for(uint256 i=0;i<members.length;i++){
        IERC20(_AirdropData.tokenAddress).transfer(members[i],amount[i]);
      }
    }
  }
}