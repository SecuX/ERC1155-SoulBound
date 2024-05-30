const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = {
    default: buildModule(`sx${Date.now()}`, (m) => {
        const sbt = m.contractAt("ERC1155SoulBound", process.env.CONTRACT_ADDRESS);
        m.call(sbt, "issueBatch", ["0xa4D19bF15601c0641ADC62Cc389b24C450cF918F", [1,2,3], [1,1,1]],
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