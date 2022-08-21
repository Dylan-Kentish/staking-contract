// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
    
error withdrawFailed();

contract RewardToken is ERC20, Ownable{
    uint256 public constant maxTotalSupply = 10000 * 10 ** 18; // 18 decimals

    constructor() ERC20("RewardToken", "RT") {
        _mint(msg.sender, maxTotalSupply);
    }

    function Withdraw() public onlyOwner {
        address _owner = owner();
        uint256 balance = address(this).balance;
        (bool success, ) = _owner.call{value: balance}("");
        if (!success) revert withdrawFailed();
    }

    receive() external payable {}
    fallback() external payable {}
}