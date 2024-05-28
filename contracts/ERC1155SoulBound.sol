// SPDX-License-Identifier: MIT
// Creator: SecuX
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ERC1155SoulBound is ERC1155Upgradeable, OwnableUpgradeable {
    address private _issuer;

    constructor() {
        _issuer = msg.sender;
    }

    function initialize(
        string memory uri,
        address issuer
    ) public initializer {
        // default owner is identical to `_issuer`.
        if (owner() == address(0)) {
            require(msg.sender == _issuer, "caller is not deployer");
        }

        __ERC1155_init(uri);
        __Ownable_init(_issuer);
        _issuer = issuer;
    }

    function setIssuer(address issuer) public onlyOwner {
        _issuer = issuer;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function issue(address account, uint256 id) public {
        _mint(account, id, 1, '');
    }
}
