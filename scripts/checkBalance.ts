import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain";

async function main() {
  const deployer = (await getNamedAccounts()).deployer;
  const amount = await ethers.provider.getBalance(deployer);
  console.log(`I am ${deployer}, and I have ${amount}`);
  const fundMe: FundMe = await ethers.getContract("FundMe");
  const contractAmt = await ethers.provider.getBalance(fundMe.address);
  console.log(
    `Contract address: ${fundMe.address}, AmountInContract: ${contractAmt}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
