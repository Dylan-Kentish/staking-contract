const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

describe("deploy NFT contract", function () {
    const baseURI = "ipfs://QmcVtVtAcFyHtVo3g4DVfjeSYtUymzS7WnvpKJrKNG78DH/"
    let owner;
    let other;
    let deployed;

    beforeEach(async function () {
        [owner, other] = await ethers.getSigners();

        //Deploy 
        const contract = await ethers.getContractFactory("NFT")
        deployed = await contract.deploy(baseURI);
        await deployed.deployed()
        console.log("NFT deployed to:", deployed.address)
    })

    describe("tokenURI", async function () {
        it("returns the expected json file for a minted token", async function () {
            await deployed.mint({
                value: await deployed.price(),
            })

            expect(await deployed.tokenURI(1)).to.equal(baseURI + "1.json")
        })

        it("returns an empty string if the base uri is empty", async function () {
            const contract = await ethers.getContractFactory("NFT")
            const emptyBaseURI = ""
            deployed = await contract.deploy(emptyBaseURI);

            await deployed.mint({
                value: await deployed.price(),
            })

            expect(await deployed.tokenURI(1)).to.equal(emptyBaseURI)
        })

        it("reverts when token id does not exist", async function() {
            await expect(deployed.tokenURI(11)).to.be.revertedWithCustomError(deployed, "missingToken")
        })
    })

    describe("mint", async function () {
        it("mints a single nft to the callers wallet", async function () {
            expect(await deployed.balanceOf(owner.address)).to.equal(0)

            await deployed.mint({
                value: await deployed.price(),
            })

            expect(await deployed.balanceOf(owner.address)).to.equal(1)
        })

        it("reverts when the max supply has been reached", async function () {
            for (let i = 0; i < 10; i++) {
                await deployed.mint({
                    value: await deployed.price(),
                })
            }

            await expect(deployed.mint({
                value: await deployed.price(),
            })).to.be.revertedWithCustomError(deployed, "exceededMaxSupply")
        })

        it("reverts if insufficient funds are sent", async function () {            
            await expect(deployed.mint()
            ).to.be.revertedWithCustomError(deployed, "insufficientFunds")
        })

        it("reverts when the contract is paused", async function () {
            await deployed.setPaused(true)

            await expect(deployed.mint({
                value: await deployed.price(),
            })).to.be.revertedWithCustomError(deployed, "contractPaused")

        })
    })

    describe("setPaused", async function () {
        it("sets the value of isPaused", async function () {
            const current = await deployed.isPaused();
            await deployed.setPaused(!current)
            expect(await deployed.isPaused()).to.equal(!current)
        })
    })

    describe("withdraw", function () {
        it("can withdraw funds", async function () {
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

        it("reverts if called by non-owner", async function () {
            await expect(deployed.connect(other).withdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
})