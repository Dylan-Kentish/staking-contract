// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const baseURI = "ipfs://QmcVtVtAcFyHtVo3g4DVfjeSYtUymzS7WnvpKJrKNG78DH/"

async function deployRewardToken() {
  const contract = await ethers.getContractFactory("RewardToken")
  deployed = await contract.deploy();
  await deployed.deployed()
  console.log("RewardToken deployed to:", deployed.address)
}

async function deployNFT() {
  const contract = await ethers.getContractFactory("NFT")
  deployed = await contract.deploy(baseURI);
  await deployed.deployed()
  console.log("NFT deployed to:", deployed.address)
}

async function main() {
  // await deployRewardToken()
  // await deployNFT()

  Verify("0xae69A5dD84720B7e1d4C87f78084235Bc075C3E2")
  Verify("0x7F1739B0f1B0FebD65168885FC6675323AbAf6ab", [baseURI])
}

async function Verify(address, constructorArguments) {
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: constructorArguments,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat compile
// npx hardhat run scripts/deploy.js --network goerli

// Latest
// RewardToken: 0xae69A5dD84720B7e1d4C87f78084235Bc075C3E2
//              https://goerli.etherscan.io/address/0xae69A5dD84720B7e1d4C87f78084235Bc075C3E2#code
// NFT:         0x7F1739B0f1B0FebD65168885FC6675323AbAf6ab
//              https://goerli.etherscan.io/address/0x7F1739B0f1B0FebD65168885FC6675323AbAf6ab#code