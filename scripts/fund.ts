import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain";

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding Contract...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  const transactionReceipt = await transactionResponse.wait(1);
  console.log("Funded");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// yarn hardhat node
// yarn hardhat run scripts/fund.ts --network localhost
