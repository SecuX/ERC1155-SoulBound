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
        __Ownable_init(msg.sender);
        _issuer = issuer;
    }

    function setIssuer(address issuer) public onlyOwner {
        require(issuer != owner(), "owner cannot be issuer");

        _issuer = issuer;
    }

    function setURI(string memory newuri) public {
        require(msg.sender == _issuer, "invalid caller");

        _setURI(newuri);
    }

    function issue(address account, uint256 id) public {
        _mint(account, id, 1, '');
    }

    function burn(address account, uint256 id, uint256 value) public {
        if (msg.sender != account && msg.sender != _issuer) {
            if (!isApprovedForAll(account, msg.sender)) {
                revert ERC1155MissingApprovalForAll(msg.sender, account);
            }
        }

        _burn(account, id, value);
    }

    /**
     * @dev Overrides _update to make token minted from issuer only.
     *
     * Requirements:
     *
     * - The caller must be issuer.
     * - The quantity must be 1.
     * - The `to` address must not have token.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override {
        if (from != address(0)) {
            require(to == address(0), "non-transferable token");
        }
        else {
            require(msg.sender == _issuer, "caller is not issuer");
        }

        super._update(from, to, ids, values);
    }
}
