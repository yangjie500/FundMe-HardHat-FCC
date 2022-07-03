import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain";

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
  console.log("Withdrawing");
  const transactionResponse = await fundMe.withdraw();
  const transactionReceipt = await transactionResponse.wait(1);
  console.log("Got it back!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// yarn hardhat node
// yarn hardhat run scripts/fund.ts --network localhost
