const hre = require("hardhat");

async function main() {
  console.log("Deploying BaseIdentityReputation to Base Mainnet...");
  
  const factory = await hre.ethers.getContractFactory("BaseIdentityReputation");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ BaseIdentityReputation deployed to Base Mainnet!");
  console.log("📍 Contract address:", address);
  console.log("\n📋 Next steps:");
  console.log("1. Verify contract on BaseScan: https://basescan.org/address/" + address);
  console.log("2. Update frontend .env with: VITE_IDENTITY_CONTRACT_ADDRESS=" + address);
  console.log("3. Update README.md with mainnet deployment info");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

