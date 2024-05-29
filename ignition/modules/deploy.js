const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = {
    default: buildModule("SecuX_Identity", (m) => {
        const sbt = m.contract("ERC1155SoulBound");
        m.call(sbt, "initialize", ["https://token-cdn-domain/{id}.json", process.env.ISSUER_ADDRESS]);

        return { sbt };
    })
}