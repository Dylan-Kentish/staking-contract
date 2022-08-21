const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("deploy RewardToken contract", function() {
    let owner;
    let other;
    let deployed;

    beforeEach(async function () {
        [owner, other] = await ethers.getSigners();

        //Deploy 
        const contract = await ethers.getContractFactory("RewardToken")
        deployed = await contract.deploy();
        await deployed.deployed()
        console.log("RewardToken deployed to:", deployed.address)
    })

    it("Should mint 10000 tokens to the deployer", async function() {
        expect(await deployed.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("10000", 18))
        expect(await deployed.balanceOf(other.address)).to.equal(0)
    })

    it("can withdraw funds", async function() {
        await owner.sendTransaction({
            to: deployed.address,
            value: ethers.utils.parseEther("1.0")
        })
        const contractBalanceBefore = await ethers.provider.getBalance(deployed.address)
        const balanceBefore = await ethers.provider.getBalance(owner.address)
        expect(contractBalanceBefore).to.be.equal(ethers.utils.parseEther("1.0"))

        await deployed.withdraw();

        expect(await await ethers.provider.getBalance(deployed.address)).to.equal(0)
        expect(await ethers.provider.getBalance(owner.address)).to.be.greaterThan(balanceBefore)
    })
})