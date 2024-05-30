const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = {
    default: buildModule(`sx${Date.now()}`, (m) => {
        const sbt = m.contractAt("ERC1155SoulBound", process.env.CONTRACT_ADDRESS);
        m.call(sbt, "issue", ["0xC4DD028e4f646ba9AEDF5394C88082983a6e5801", 0, 1],
            {
                from: {
                    type: "ACCOUNT",
                    accountIndex: 1,
                }
            }
        );

        return { sbt };
    })
}