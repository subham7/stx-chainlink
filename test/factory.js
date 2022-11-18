const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Factory Contract testing", async () => {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployContracts() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount,user1,user2,user3,user4,gnosisSafe] = await ethers.getSigners();
        const USDC = await ethers.getContractFactory("USDC");
        const usdcContract = await USDC.deploy();
        await usdcContract.deployed();

        const factory = await ethers.getContractFactory("FactoryCloneContract");
        const factoryContract = await factory.deploy(usdcContract.address);
        await factoryContract.deployed();

        var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,10,true,50,50,gnosisSafe.address];
        let txObject = await factoryContract.connect(gnosisSafe).createDAO(tuple);
        let x = await txObject.wait();
        var daoAddress = x.logs[0].address;
        
        var daoContract = await hre.ethers.getContractAt("ERC20NonTransferable",daoAddress);
        
        return { factoryContract, usdcContract, owner,user1,user2,user3,user4,gnosisSafe,daoContract};
    }

    it("Deploy factory, proxy, usdc, emitter contract", async function () {
        this.timeout(40000)
        const { factoryContract, usdcContract, owner } = await loadFixture(
            deployContracts
        );

        expect(await factoryContract.owner()).to.equal(owner.address);
    });

    it("Deploy factory contract with invalid USDC address should fail",async function(){
        const factory = await ethers.getContractFactory("FactoryCloneContract");
        await expect(factory.deploy('0x0000000000000000000000000000000000000000')).to.be.revertedWith("Invalid address")
        
    });

    it("Check the owner of factory", async function () {
        this.timeout(40000)
        const { factoryContract, usdcContract, owner } = await loadFixture(
            deployContracts
        );
        expect(await factoryContract.owner()).to.equal(owner.address);
    });
    
    describe("USDC method testing(changeUSDCAddress)", function () {
    
        it("Check USDC address", async function () {
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );
            expect(await factoryContract.USDCAddress()).to.equal(usdcContract.address);
        })
    
        it("Change USDC address", async function () {
            //get contract details
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );

            //deploy temp USDC
            const USDC = await ethers.getContractFactory("USDC");
            tempUsdcContract = await USDC.deploy();

            //Change USDC
            let txObject = await factoryContract.changeUSDCAddress(
                tempUsdcContract.address
            );
            await txObject.wait();

            //Check
            expect(await factoryContract.USDCAddress()).to.equal(
                tempUsdcContract.address
            );

            //Change back to original USDC address
            let txObject2 = await factoryContract.changeUSDCAddress(
                usdcContract.address
            );
            await txObject2.wait();
        });
        
        it("Change USDC to invalid address should fail", async function () {
            //get contract details
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );

            await expect(factoryContract.changeUSDCAddress("0x0000000000000000000000000000000000000000")).to.be.revertedWith("Invalid address");
        });
     
        it("Only owner can change the USDC address",async function (){
            //get contract details
            const { factoryContract, usdcContract, owner,user1 } = await loadFixture(
                deployContracts
            );

            //deploy temp USDC
            const USDC = await ethers.getContractFactory("USDC");
            tempUsdcContract = await USDC.deploy();

            //Change USDC
            await expect (factoryContract.connect(user1).changeUSDCAddress(
                tempUsdcContract.address
            )).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    
    describe("Implementation method testing(changeDAOImplementation)", async function (){
    
        it("Check implementation address", async function(){
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );
            expect(await factoryContract.ImplementationAddress());
        });
  
        it("Change Implementation address", async function () {
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );

            //Deploying USDC for the testing
            const Implementation = await ethers.getContractFactory(
                "ERC20NonTransferable"
            );
            newImplementation = await Implementation.deploy();
            await newImplementation.deployed();

            let txObject = await factoryContract.changeDAOImplementation(
                newImplementation.address
            );
            await txObject.wait();

            expect(await factoryContract.ImplementationAddress()).to.equal(
                newImplementation.address
            );
        });
      
        it("Change Implementation to invalid address should fail", async function () {
            //get contract details
            const { factoryContract, usdcContract, owner } = await loadFixture(
                deployContracts
            );

            await expect(factoryContract.changeDAOImplementation("0x0000000000000000000000000000000000000000")).to.be.revertedWith("Invalid address");
        });
       
        it("Only owner can change the implementation address",async function (){
            const { factoryContract, usdcContract, owner,user1 } = await loadFixture(
                deployContracts
            );

            //Deploying Implementation for the testing
            const Implementation = await ethers.getContractFactory(
                "ERC20NonTransferable"
            );
            newImplementation = await Implementation.deploy();
            await newImplementation.deployed();
            //Change Implementation
            await expect (factoryContract.connect(user1).changeDAOImplementation(
                newImplementation.address
            )).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
  
    describe('Create dao method testing(createDAO)', async function(){
     
        it('Create Dao',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,10,true,50,50,gnosisSafe.address];
            let txObject = await factoryContract.connect(gnosisSafe).createDAO(tuple);
            let x = await txObject.wait();
            daoAddress = x.logs[0].address;
            
            daoContract = await hre.ethers.getContractAt("ERC20NonTransferable",daoAddress);
            // await daoContract.connect(user1);
        });
     
        it('Max should be grater than min in create DAO',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,100000000,100000000,10,10,true,50,50,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Amount should be grater than min amount")
        });
     
        it('Total raise should be grater than max in create DAO',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,100000000,10000000000,10,10,true,50,50,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Total raise amount should be grater than max amount")
        });
      
        it('Days should be grater than 0 in create DAO',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,0,true,50,50,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Days cannot be 0")
        });
     
        it('Owner fee cannot be 100 in create DAO',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,100,10,true,50,50,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Owner fee cannot exceed 100")
        });
        
        it('Owner address cannot be null in create DAO',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,10,true,50,50,'0x0000000000000000000000000000000000000000'];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Owner cannot be null");
        });
        
        it('Quorum cannot exceed 100 in create DAO method',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,10,true,101,50,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Quorum should be less then or equal to 100");
        });
        
        it('Threshold cannot exceed 100 in create DAO method',async () =>{
            this.timeout(40000)
            const { factoryContract, usdcContract, owner,gnosisSafe,user1 } = await loadFixture(
                deployContracts
            );
            
            var tuple = ["Testing","TEST",1000000000,10000000,100000000,10,10,true,50,101,gnosisSafe.address];
            await expect(factoryContract.connect(gnosisSafe).createDAO(tuple)).to.be.revertedWith("Threshold should be less then or equal to 100");
        });
        it("Check owner address",async function(){
            const { factoryContract, usdcContract, owner,gnosisSafe,user1,daoContract } = await loadFixture(
                deployContracts
            );
            expect(await daoContract.connect(user1).daoOwnerAddress()).to.equal(gnosisSafe.address);
        });
    
        it("Check DAO config",async function(){
            const { factoryContract, usdcContract, owner,gnosisSafe,user1,daoContract } = await loadFixture(
                deployContracts
            );
            
            expect(await daoContract.connect(user1).name()).to.equal('Testing');
            expect(await daoContract.connect(user1).symbol()).to.equal('TEST');
            expect(await daoContract.connect(user1).minDepositPerUser()).to.equal(10000000);
            expect(await daoContract.connect(user1).maxDepositPerUser()).to.equal(100000000);
            expect(await daoContract.connect(user1).totalRaiseAmount()).to.equal(1000000000);
            expect(await daoContract.connect(user1).quorum()).to.equal(50);
            expect(await daoContract.connect(user1).threshold()).to.equal(50);
            expect(await daoContract.connect(user1).ownerFeePerDeposit()).to.equal(10);
            expect(await daoContract.connect(user1).feeUSDC()).to.equal(true);  
        });
    });


});