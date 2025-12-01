require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { BASE_SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532
    }
  }
};
