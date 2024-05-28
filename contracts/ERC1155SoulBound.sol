// SPDX-License-Identifier: MIT
// Creator: SecuX
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ERC1155SoulBound is ERC1155BurnableUpgradeable, OwnableUpgradeable {
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
            if (to != address(0)) {
                revert("SoulboundTokenCannotBeTransferred");
            }
        }
        
        require(to == address(0) || msg.sender == _issuer, "caller is not issuer");
        require(ids.length == 1, "quantity must be 1");
        require(values.length == 1, "quantity must be 1");
        require(values[0] == 1, "quantity must be 1");
        require(balanceOf(to, ids[0]) == 0, "address has already issued");

        super._update(from, to, ids, values);
    }
}
