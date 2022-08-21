// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error contractPaused();
error missingToken();
error insufficientFunds();
error exceededMaxSupply();
error withdrawFailed();

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string baseTokenURI;
    uint256 public price = 0.01 ether;
    uint256 public maxTokenIds = 10;
    uint256 public tokenId;
    bool public isPaused;

    modifier pause() {
        if(isPaused) revert contractPaused();
        _;
    }

    constructor(string memory baseURI) ERC721("NonFungibleToken", "NFT") {
        baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 id) public view virtual override returns (string memory) {
        if(!_exists(id)) revert missingToken();

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ?
            string(abi.encodePacked(baseURI, id.toString(), ".json")) :
            "";
    }

    function mint() public payable pause {
        if (tokenId >= maxTokenIds) revert exceededMaxSupply();
        if (msg.value < price) revert insufficientFunds();

        unchecked {
            ++tokenId;
        }

        _safeMint(msg.sender, tokenId);
    }

    function setPaused(bool paused) public onlyOwner {
        isPaused = paused;
    }
    
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 balance = address(this).balance;
        (bool success, ) = _owner.call{value: balance}("");
        if (!success) revert withdrawFailed();
    }

    receive() external payable {}
    fallback() external payable {}
}