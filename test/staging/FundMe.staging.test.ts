import { FundMe } from "../../typechain";
import { getNamedAccounts, ethers, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { developmentChains } from "../../helper-hardhat-config";
import { assert } from "chai";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe: FundMe;
      let deployer: Address;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
