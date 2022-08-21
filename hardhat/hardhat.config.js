require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: ".env" })

const GOERLI_API_URI = process.env.GOERLI_API_URI;
const GOERLI_API_KEY = process.env.GOERLI_API_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: GOERLI_API_URI,
      accounts: [GOERLI_API_KEY]
    }
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_KEY
    }
  }
};
