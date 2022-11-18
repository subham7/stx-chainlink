const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Implementation Contract (DAO testing)", async () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {
    // Contracts are deployed using the first signer/account by default
    const [owner, usdcOwner, user1, user2, user3, user4, gnosisSafe] =
      await ethers.getSigners();

    const USDC = await ethers.getContractFactory("USDC");
    const usdcContract = await USDC.connect(usdcOwner).deploy();
    await usdcContract.deployed();

    const emitter = await ethers.getContractFactory("Emitter");
    const emitterContract = await emitter.deploy();
    await emitterContract.deployed();
    await emitterContract.Initialize(
      "0x0000000000000000000000000000000000000000",
      usdcContract.address,
      owner.address
    );

    const implementation = await ethers.getContractFactory(
      "ERC20NonTransferable"
    );
    const implementationContract = await implementation.deploy();
    await implementationContract.deployed();
    await implementationContract.initializeERC20(
      "Testing",
      "TEST",
      1000000000,
      10000000,
      100000000,
      10,
      10,
      true,
      50,
      50,
      gnosisSafe.address,
      usdcContract.address,
      emitterContract.address
    );

    const implementationContract2 = await implementation.deploy();
    await implementationContract2.deployed();
    await implementationContract2.initializeERC20(
      "Testing",
      "TEST",
      1000000000,
      10000000,
      100000000,
      10,
      10,
      false,
      50,
      50,
      gnosisSafe.address,
      usdcContract.address,
      emitterContract.address
    );

    const implementationContract3 = await implementation.deploy();
    await implementationContract3.deployed();
    await implementationContract3.initializeERC20(
      "Testing",
      "TEST",
      101000000,
      10000000,
      100000000,
      10,
      10,
      false,
      50,
      50,
      gnosisSafe.address,
      usdcContract.address,
      emitterContract.address
    );

    await emitterContract.createDao(
      gnosisSafe.address,
      implementationContract3.address,
      "Testing",
      "TEST",
      101000000,
      10000000,
      100000000,
      10,
      10,
      true,
      50,
      50,
      emitterContract.address
    );

    await emitterContract.createDao(
      gnosisSafe.address,
      implementationContract.address,
      "Testing",
      "TEST",
      1000000000,
      10000000,
      100000000,
      10,
      10,
      true,
      50,
      50,
      emitterContract.address
    );

    return {
      usdcContract,
      owner,
      user1,
      user2,
      user3,
      user4,
      gnosisSafe,
      implementationContract,
      implementationContract2,
      implementationContract3,
    };
  }

  describe("Update min max deposit(updateMinMaxDeposit)", async function () {
    it("Check the min max deposit amount", async function () {
      const { user1, user2, user3, user4, gnosisSafe, implementationContract } =
        await loadFixture(deployContracts);

      expect(
        await implementationContract.connect(gnosisSafe).minDepositPerUser()
      ).to.equal("10000000");
      expect(
        await implementationContract.connect(gnosisSafe).maxDepositPerUser()
      ).to.equal("100000000");
    });

    it("Change the min max deposit per user", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      let x = await implementationContract
        .connect(owner)
        .updateMinMaxDeposit(100000000, 1000000000);
      await x.wait();

      expect(
        await implementationContract.connect(owner).minDepositPerUser()
      ).to.equal("100000000");
      expect(
        await implementationContract.connect(owner).maxDepositPerUser()
      ).to.equal("1000000000");
    });

    it("Only admin can change the min max deposit per user", async function () {
      const { user1, user2, user3, user4, gnosisSafe, implementationContract } =
        await loadFixture(deployContracts);

      await expect(
        implementationContract
          .connect(user1)
          .updateMinMaxDeposit(100000000, 1000000000)
      ).to.be.revertedWith("Only Admin");
    });

    it("Max should be grater than min in change change min max deposit per user", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      await expect(
        implementationContract
          .connect(owner)
          .updateMinMaxDeposit(1000000000, 100000000)
      ).to.be.revertedWith("Max amount should be grater than min");
    });
  });

  describe("Update owner fee(updateOwnerFee)", async function () {
    it("check the owner fee", async function () {
      const { user1, user2, user3, user4, gnosisSafe, implementationContract } =
        await loadFixture(deployContracts);

      expect(
        await implementationContract.connect(gnosisSafe).ownerFeePerDeposit()
      ).to.equal(10);
    });

    it("Change the owners fee", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      let x = await implementationContract.connect(owner).updateOwnerFee(20);
      await x.wait();

      expect(
        await implementationContract.connect(owner).ownerFeePerDeposit()
      ).to.equal(20);
    });

    it("Owner fee cannot be grater than or equal to 100", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      await expect(
        implementationContract.connect(owner).updateOwnerFee(100)
      ).to.be.revertedWith("Owners fees cannot exceed 100");
    });

    it("Only owner can change the owner fee", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      await expect(
        implementationContract.connect(user1).updateOwnerFee(30)
      ).to.be.revertedWith("Only Admin");
    });
  });

  describe("Close deposit (closeDeposit)", async function () {
    it("close deposit", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      let x = await implementationContract.connect(owner).closeDeposit();
      await x.wait();

      expect(
        await implementationContract.connect(owner).checkDeposit()
      ).to.equal(false);
    });

    it("Cannot close deposit if it's already closed", async function () {
      const {
        user1,
        user2,
        user3,
        user4,
        gnosisSafe,
        implementationContract,
        owner,
      } = await loadFixture(deployContracts);

      let x = await implementationContract.connect(owner).closeDeposit();
      await x.wait();

      await expect(
        implementationContract.connect(owner).closeDeposit()
      ).to.be.revertedWith("Deposit already closed");
    });

    it("Only admin can close deposit", async function () {
      const { user1, user2, user3, user4, gnosisSafe, implementationContract } =
        await loadFixture(deployContracts);

      await expect(
        implementationContract.connect(user1).closeDeposit()
      ).to.be.revertedWith("Only Admin");
    });
  });
});

// Token Gating Test
describe("Setup Token Gating", async function () {
  it("sets up token gating", async function () {
    const { user1, implementationContract, owner } = await loadFixture(
      deployContracts
    );

    let x = await implementationContract
      .connect(owner)
      .setupTokenGating([user1, user1], [100, 200], ["AND"], [false, false]);

    await x.wait();

    let responseTokenList = await implementationContract.getGatingTokenList();

    let responseTokenOperation =
      await implementationContract().getGatingTokenOperations(0);

    expect(responseTokenList).to.equal(2);
    expect(responseTokenOperation).to.equal("AND");
  });
});

describe("Start deposit (startDeposit)", async function () {
  it("Start deposit", async function () {
    const { user1, user2, user3, user4, owner, implementationContract } =
      await loadFixture(deployContracts);

    let x1 = await implementationContract.connect(owner).closeDeposit();
    await x1.wait();

    let x = await implementationContract.connect(owner).startDeposit(10);
    await x.wait();

    expect(await implementationContract.connect(owner).checkDeposit()).to.equal(
      true
    );
  });

  it("Start deposit with days equal to zero should fail", async function () {
    const { user1, user2, user3, user4, owner, implementationContract } =
      await loadFixture(deployContracts);

    let x1 = await implementationContract.connect(owner).closeDeposit();
    await x1.wait();

    await expect(
      implementationContract.connect(owner).startDeposit(0)
    ).to.be.revertedWith("Days should be grater than 0");
  });

  it("Start deposit should fail if deposit is already running", async function () {
    const { user1, user2, user3, user4, owner, implementationContract } =
      await loadFixture(deployContracts);

    await expect(
      implementationContract.connect(owner).startDeposit(10)
    ).to.be.revertedWith("Deposit already started");
  });

  it("Only admin can start deposit", async function () {
    const { user1, user2, user3, user4, owner, implementationContract } =
      await loadFixture(deployContracts);

    let x1 = await implementationContract.connect(owner).closeDeposit();
    await x1.wait();

    await expect(
      implementationContract.connect(user1).startDeposit(10)
    ).to.be.revertedWith("Only Admin");
  });
});

describe("Testing Deposit function(deposit)", async () => {
  it("Try Deposit with fees in USDC", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, owner } =
      await loadFixture(deployContracts);

    await usdcContract.connect(user1).mint(user1.address, 10000);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract.address, 100000000);
    let data = await x.wait();
    await implementationContract
      .connect(user1)
      .deposit(usdcContract.address, 100000000);
    expect(
      await implementationContract.connect(user1).balanceOf(user1.address)
    ).to.equal("100000000000000000000");
    expect(
      await usdcContract.connect(gnosisSafe).balanceOf(owner.address)
    ).to.equal(10000000);
  });

  it("Try amount less than min balance", async () => {
    const { user1, implementationContract, usdcContract } = await loadFixture(
      deployContracts
    );

    await usdcContract.connect(user1).mint(user1.address, 10000);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract.address, 1000000);
    let data = await x.wait();
    await expect(
      implementationContract
        .connect(user1)
        .deposit(usdcContract.address, 1000000)
    ).to.be.revertedWith("Amount less than min criteria");
    // expect(await implementationContract.connect(user1).balanceOf(user1.address)).to.equal("100000000000000000000");
  });

  it("Try amount grater than max balance", async () => {
    const { user1, implementationContract, usdcContract } = await loadFixture(
      deployContracts
    );

    await usdcContract.connect(user1).mint(user1.address, 1000000000);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract.address, 1000000000);
    let data = await x.wait();
    await expect(
      implementationContract
        .connect(user1)
        .deposit(usdcContract.address, 1000000000)
    ).to.be.revertedWith("Amount greater than max criteria");
    // expect(await implementationContract.connect(user1).balanceOf(user1.address)).to.equal("100000000000000000000");
  });

  it("Try depositing another token than usdc", async () => {
    const { user1, implementationContract, usdcContract } = await loadFixture(
      deployContracts
    );

    //deploy temp USDC
    const USDC = await ethers.getContractFactory("USDC");
    const tempUsdcContract = await USDC.deploy();

    await tempUsdcContract.connect(user1).mint(user1.address, 10000000);
    let x = await tempUsdcContract
      .connect(user1)
      .approve(implementationContract.address, 10000000);
    let data = await x.wait();
    await expect(
      implementationContract
        .connect(user1)
        .deposit(tempUsdcContract.address, 10000000)
    ).to.be.revertedWith("Only USDC allowed");
  });

  it("try deposit if amount has exceed total raise amount", async () => {
    const { usdcContract, owner, gnosisSafe, user1, implementationContract3 } =
      await loadFixture(deployContracts);

    await usdcContract.connect(user1).mint(user1.address, 10000);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract3.address, 1000000000);
    let data = await x.wait();
    let a = await implementationContract3
      .connect(user1)
      .deposit(usdcContract.address, 100000000);
    await a.wait();
    await expect(
      implementationContract3
        .connect(user1)
        .deposit(usdcContract.address, 100000000)
    ).to.be.rejectedWith("DAO exceeded total raise amount");
  });

  it("try deposit into DAO where fees in GT token", async () => {
    const { user1, usdcContract, gnosisSafe, implementationContract2, owner } =
      await loadFixture(deployContracts);

    await usdcContract.connect(user1).mint(user1.address, 10000);
    let x1 = await usdcContract
      .connect(user1)
      .approve(implementationContract2.address, 100000000);
    let data = await x1.wait();
    await implementationContract2
      .connect(user1)
      .deposit(usdcContract.address, 100000000);
    expect(
      await implementationContract2.connect(user1).balanceOf(user1.address)
    ).to.equal("90000000000000000000");
    expect(
      await implementationContract2.connect(gnosisSafe).balanceOf(owner.address)
    ).to.equal("10000000000000000000");
  });
});

describe("Execute proposal(updateProposalAndExecution)", async function () {
  it("Airdrop token", async function () {
    const {
      user1,
      implementationContract,
      usdcContract,
      gnosisSafe,
      user2,
      owner,
    } = await loadFixture(deployContracts);
    const AIRDROP_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [true, false, false, false, false, false],
      0,
      0,
      "1000000000",
      "100000000",
      [],
      [],
      [],
      [],
      10,
      [],
    ];

    //member 1
    await usdcContract.connect(user1).mint(user1.address, 100);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract.address, "100000000");
    await x.wait();
    await implementationContract
      .connect(user1)
      .deposit(usdcContract.address, "100000000");

    //member 2
    await usdcContract.connect(user2).mint(user2.address, "100");
    let x2 = await usdcContract
      .connect(user2)
      .approve(implementationContract.address, "100000000");
    await x2.wait();
    await implementationContract
      .connect(user2)
      .deposit(usdcContract.address, "100000000");

    //airdrop
    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(AIRDROP_PROPOSAL);

    expect(await usdcContract.balanceOf(user1.address)).to.be.equal("45000000");
    expect(await usdcContract.balanceOf(user2.address)).to.be.equal("45000000");
    expect(await usdcContract.balanceOf(owner.address)).to.be.equal("30000000");
  });

  it("Airdrop token with owner fee grater than 100", async function () {
    const {
      user1,
      implementationContract,
      usdcContract,
      gnosisSafe,
      user2,
      owner,
    } = await loadFixture(deployContracts);
    const AIRDROP_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [true, false, false, false, false, false],
      0,
      0,
      "1000000000",
      "100000000",
      [],
      [],
      [],
      [],
      100,
      [],
    ];

    //member 1
    await usdcContract.connect(user1).mint(user1.address, 100);
    let x = await usdcContract
      .connect(user1)
      .approve(implementationContract.address, "100000000");
    await x.wait();
    await implementationContract
      .connect(user1)
      .deposit(usdcContract.address, "100000000");

    //member 2
    await usdcContract.connect(user2).mint(user2.address, "100");
    let x2 = await usdcContract
      .connect(user2)
      .approve(implementationContract.address, "100000000");
    await x2.wait();
    await implementationContract
      .connect(user2)
      .deposit(usdcContract.address, "100000000");

    //airdrop
    await expect(
      implementationContract
        .connect(gnosisSafe)
        .updateProposalAndExecution(AIRDROP_PROPOSAL)
    ).to.be.revertedWith("Owner fees should be less than 100");
  });

  it("Mint GT tokens", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const MINT_GT_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, true, false, false, false, false],
      0,
      0,
      1000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [],
      [],
      10,
      [],
    ];

    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(MINT_GT_PROPOSAL);

    expect(
      await implementationContract.connect(gnosisSafe).balanceOf(user1.address)
    ).to.be.equal("10000000000000000000");
    expect(
      await implementationContract.connect(gnosisSafe).balanceOf(user2.address)
    ).to.be.equal("10000000000000000000");
  });

  it("Mint GT tokens with invalid parameter should fail", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const MINT_GT_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, true, false, false, false, false],
      0,
      0,
      1000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address, usdcContract.address],
      [],
      [],
      10,
      [],
    ];

    await expect(
      implementationContract
        .connect(gnosisSafe)
        .updateProposalAndExecution(MINT_GT_PROPOSAL)
    ).to.be.revertedWith("Invalid parameters");
  });

  it("Update governor settings", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const GOVERNOR_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, true, false, false, false],
      40,
      40,
      1000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [],
      [],
      10,
      [],
    ];

    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(GOVERNOR_PROPOSAL);
    expect(await implementationContract.connect(user1).quorum()).to.be.equal(
      40
    );
    expect(await implementationContract.connect(user1).threshold()).to.be.equal(
      40
    );
  });

  it("Update governor settings should fail with threshold grater than 100", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const GOVERNOR_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, true, false, false, false],
      40,
      101,
      1000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [],
      [],
      10,
      [],
    ];

    await expect(
      implementationContract
        .connect(gnosisSafe)
        .updateProposalAndExecution(GOVERNOR_PROPOSAL)
    ).to.be.revertedWith("Threshold should be less than 100");
  });

  it("Update governor settings should fail with quorum grater than 100", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const GOVERNOR_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, true, false, false, false],
      101,
      40,
      1000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [],
      [],
      10,
      [],
    ];

    await expect(
      implementationContract
        .connect(gnosisSafe)
        .updateProposalAndExecution(GOVERNOR_PROPOSAL)
    ).to.be.revertedWith("Quorum should be less than 100");
  });

  it("Update raise amount", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);
    const RAISE_AMOUNT_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, false, true, false, false],
      40,
      40,
      5000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [],
      [],
      10,
      [],
    ];

    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(RAISE_AMOUNT_PROPOSAL);
    expect(
      await implementationContract.connect(user1).totalRaiseAmount()
    ).to.be.equal("5000000000");
  });

  it("Send custom token", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);

    await usdcContract.connect(user1).mint(implementationContract.address, 100);
    const SEND_CUSTOM_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, false, false, true, false],
      40,
      40,
      5000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [10000000, 10000000],
      [user1.address, user2.address],
      10,
      [],
    ];

    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(SEND_CUSTOM_PROPOSAL);
    expect(await usdcContract.balanceOf(user1.address)).to.be.equal(10000000);
    expect(await usdcContract.balanceOf(user2.address)).to.be.equal(10000000);
  });

  it("Send custom token should fail with invalid parameters", async function () {
    const { user1, implementationContract, usdcContract, gnosisSafe, user2 } =
      await loadFixture(deployContracts);

    await usdcContract.connect(user1).mint(implementationContract.address, 100);
    const SEND_CUSTOM_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, false, false, true, false],
      40,
      40,
      5000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [10000000, 10000000],
      [user1.address, user2.address, user2.address],
      10,
      [],
    ];

    await expect(
      implementationContract
        .connect(gnosisSafe)
        .updateProposalAndExecution(SEND_CUSTOM_PROPOSAL)
    ).to.be.revertedWith("Invalid parameters");
  });

  it("Add admin proposal", async function () {
    const {
      user1,
      implementationContract,
      usdcContract,
      gnosisSafe,
      user2,
      owner,
    } = await loadFixture(deployContracts);
    const SEND_CUSTOM_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, false, false, false, true],
      40,
      40,
      5000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [10000000, 10000000],
      [user1.address, user2.address],
      10,
      [user1.address, user2.address],
    ];

    await implementationContract
      .connect(gnosisSafe)
      .updateProposalAndExecution(SEND_CUSTOM_PROPOSAL);
    let x = await implementationContract.connect(owner).closeDeposit();
    await x.wait();

    expect(await implementationContract.connect(owner).checkDeposit()).to.equal(
      false
    );
  });

  it("Admin cannot execute proposal", async function () {
    const {
      user1,
      implementationContract,
      usdcContract,
      gnosisSafe,
      user2,
      owner,
    } = await loadFixture(deployContracts);
    const SEND_CUSTOM_PROPOSAL = [
      "0ax",
      "pass",
      1,
      usdcContract.address,
      usdcContract.address,
      [false, false, false, false, false, true],
      40,
      40,
      5000000000,
      100000000,
      ["10000000000000000000", "10000000000000000000"],
      [user1.address, user2.address],
      [10000000, 10000000],
      [user1.address, user2.address],
      10,
      [user1.address, user2.address],
    ];

    await expect(
      implementationContract
        .connect(owner)
        .updateProposalAndExecution(SEND_CUSTOM_PROPOSAL)
    ).to.be.revertedWith("Only Owner");
  });
});
