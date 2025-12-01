const hre = require("hardhat");

async function main() {
  const factory = await hre.ethers.getContractFactory("BaseIdentityReputation");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BaseIdentityReputation deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
