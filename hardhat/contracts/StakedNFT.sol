// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

abstract contract NonTransferableERC721 is ERC721 {
    error NonTransferable();
    error NonApprovable();

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (to != address(0) && from != address(0)) {
            revert NonTransferable();
        }
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function approve(address, uint256) public virtual override {
        revert NonApprovable();
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert NonApprovable();
    }
}

contract StakedNFT is NonTransferableERC721, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;

    error missingToken();

    string baseTokenURI;

    uint256 public expirationBlockNumber;
    mapping(uint256 => uint256) public rewardRates;
    mapping(uint256 => uint256) public claimedAt;

    IERC721Enumerable public nft;
    IERC20 public token;

    constructor(
        string memory _baseURI,
        IERC721Enumerable _nft,
        IERC20 _token,
        uint256[] memory _rewardRates
    ) ERC721("StakedNonFungibleToken", "sNFT") {
        nft = _nft;
        token = _token;
        expirationBlockNumber = type(uint256).max;

        // length = _rewardRates.length;
        // for (uint256 index = 0; index < length; index++) {}
        // rewardRates = _rewardRates;

        // SetBaseURI();
    }

    function tokenURI(uint256 id) public view virtual override returns (string memory) {
        if(!_exists(id)) revert missingToken();

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ?
            string(abi.encodePacked(baseURI, id.toString(), ".json")) :
            "";
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseURI) public virtual {
        baseTokenURI = _baseURI;
    }
}
