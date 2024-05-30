const { deployContract } = require("./helpers.js");
const { expect } = require("chai");

describe("ERC1155SoulBound", async function () {
  const contractName = "ERC1155SoulBound";
  const metadataUri = "https://token-cdn-domain/{id}.json";

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

    it("cannot set owner as issuer", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.owner).setIssuer(this.owner.address)
      ).to.be.revertedWith("owner cannot be issuer");
    });
  });

  describe("Issue", function () {
    let tokenid = Math.ceil(Math.random() * 1e10);
    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
    });

    it("can issue token", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
    });

    it("can issue multiple tokens", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
      await this.erc1155SoulBound.connect(this.issuer).issueBatch(this.addr1.address, [tokenid], [1]);
    });

    it("cannot issue token without issuer", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.owner).issue(this.addr1.address, tokenid, 1)
      ).to.be.revertedWith("caller is not issuer");

      await expect(
        this.erc1155SoulBound.connect(this.owner).issueBatch(this.addr1.address, [tokenid], [1])
      ).to.be.revertedWith("caller is not issuer");
    });

    it("can issue token (burnt before)", async function () {
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
      await this.erc1155SoulBound.connect(this.addr1).burn(this.addr1.address, tokenid, 1);
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
    });
  });

  describe("Transfer", function () {
    let tokenid = Math.ceil(Math.random() * 1e10);
    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
    });

    it("cannot transfer token", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.addr1).safeTransferFrom(this.addr1.address, this.addr2.address, tokenid, 1, '0x')
      ).to.be.revertedWith("non-transferable token");
    });
  });

  describe("Burn", function () {
    let tokenid = Math.ceil(Math.random() * 1e10);
    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr1.address, tokenid, 1);
      await this.erc1155SoulBound.connect(this.issuer).issue(this.addr2.address, tokenid, 1);
    });

    it("owner can burn token", async function () {
      await this.erc1155SoulBound.connect(this.addr2).burn(this.addr2.address, tokenid, 1);
    });

    it("owner can burn token (batch)", async function () {
      await this.erc1155SoulBound.connect(this.addr2).burnBatch(this.addr2.address, [tokenid], [1]);
    });

    it("issuer can burn token", async function () {
      await this.erc1155SoulBound.connect(this.issuer).burn(this.addr2.address, tokenid, 1);
    });

    it("cannot burn token without owner", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.addr2).burn(this.addr1.address, tokenid, 1)
      ).to.be.reverted;

      await expect(
        this.erc1155SoulBound.connect(this.addr2).burnBatch(this.addr1.address, [tokenid], [1])
      ).to.be.reverted;
    });
  });

  describe("URI", function () {
    const newUri = "https://token-cdn-domain-2/{id}.json";

    beforeEach(async function () {
      await this.erc1155SoulBound.connect(this.owner).initialize(metadataUri, this.issuer.address);
    });

    it("URI initialized", async function () {
      expect(await this.erc1155SoulBound.uri(0)).to.equal(metadataUri);
    });

    it("owner cannot set URI", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.owner).setURI(newUri)
      ).to.be.revertedWith("invalid caller");
    });

    it("issuer can set URI", async function () {
      await this.erc1155SoulBound.connect(this.issuer).setURI(newUri);
      expect(await this.erc1155SoulBound.uri(0)).to.equal(newUri);
    });

    it("others cannot set URI", async function () {
      await expect(
        this.erc1155SoulBound.connect(this.addr1).setURI(newUri)
      ).to.be.reverted;
    });

    it("issuer can set tokenURI", async function () {
      const tokenURI = Math.ceil(Math.random() * 1e18).toString();
      await this.erc1155SoulBound.connect(this.issuer).setTokenURI(1, tokenURI);
      expect(await this.erc1155SoulBound.uri(0)).to.equal(metadataUri);
      expect(await this.erc1155SoulBound.uri(1)).to.equal(tokenURI);
    });
  });
});
