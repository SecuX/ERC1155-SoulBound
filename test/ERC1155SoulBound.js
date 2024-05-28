const { deployContract } = require("./helpers.js");
const { expect } = require("chai");

describe("ERC1155SoulBound", async function () {
  const contractName = "ERC1155SoulBound";
  const metadataUri = "";

  beforeEach(async function () {
    const [owner, issuer, addr1, addr2] = await ethers.getSigners();
    this.owner = owner;
    this.issuer = issuer;
    this.addr1 = addr1;
    this.addr2 = addr2;

    this.erc1155SoulBound = await deployContract(contractName);
  });

  describe("Initialize", function () {
    it("can initialize contract", async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
    });

    it("cannot initialize again", async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address)
      await expect(
        this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address)
      ).to.be.reverted;
    });

    it("cannot initialize contract without deployer", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.addr1).initialize(metadataUri, this.issuer.address)
      ).to.be.revertedWith("caller is not deployer");
    });
  });

  describe("Deployment", function () {
    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
    });

    it("can set issuer", async function () {
      await this.erc1155SoulBound.connect(this.owner).setIssuer(this.issuer.address)
    });

    it("cannot set issuer without owner", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.issuer).setIssuer(this.issuer.address)
      ).to.be.reverted;
    });
  });

  describe("Issue", function () {
    let tokenid = Math.ceil(Math.random() * 1e10);
    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
    });

    it("can issue token", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid);
    });

    it("cannot issue multiple tokens", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid);
      await expect(
        this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid)
      ).to.be.revertedWith("address has already issued");
    });

    it("cannot issue token without issuer", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.owner).issue(this.addr1.address, tokenid)
      ).to.be.revertedWith("caller is not issuer");
    });

    it("can issue token (burnt before)", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid);
      await this.erc1155SoulBound.connect(this.addr1).burn(this.addr1.address, tokenid, 1);
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid);
    });
  });
});
