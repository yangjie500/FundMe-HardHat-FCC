import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe: FundMe;
      let deployer: string;
      let mockV3Aggregator: MockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async () => {
        // Deploy fundMe contract
        // using Hardhat-deploy
        // Or
        // const accounts = await ethers.getSigners();
        // const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        // Any function called here will be called by deployer itself
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(mockV3Aggregator.address, response);
        });
      });

      describe("fund", () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("Updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of getFunder", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getFunder(0);
          assert.equal(response, deployer);
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single founder", async () => {
          // Arrange
          // Or ethers.provider.getBalance()
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Assert
          assert.equal(endingFundMeBalance.toNumber(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allows us to withdraw with multiple getFunder", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          console.log(startingFundMeBalance.toString());

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toNumber(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;

          console.log(
            (
              await fundMe.getAddressToAmountFunded(accounts[1].address)
            ).toString()
          );
          console.log(endingDeployerBalance.add(gasCost).toString());

          for (let i = 1; i < 6; i++) {
            assert.equal(
              (
                await fundMe.getAddressToAmountFunded(accounts[i].address)
              ).toString(),
              "0"
            );
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });

        it("cheaperWithdraw testing...", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          console.log(startingFundMeBalance.toString());

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          // Assert
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance.toNumber(), 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          // Make sure that the getFunder are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;

          console.log(
            (
              await fundMe.getAddressToAmountFunded(accounts[1].address)
            ).toString()
          );
          console.log(endingDeployerBalance.add(gasCost).toString());

          for (let i = 1; i < 6; i++) {
            assert.equal(
              (
                await fundMe.getAddressToAmountFunded(accounts[i].address)
              ).toString(),
              "0"
            );
          }
        });
      });
    });
