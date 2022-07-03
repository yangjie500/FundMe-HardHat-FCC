import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;

  let ethUsdPriceFeedAddress: string;

  if (chainId == 31337) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]!;
  }

  log("---------------------------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");

  // If the contract doesn't exist, deploy minimal version of our local testing

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // constructor argument
    log: true,
    waitConfirmations: networkConfig[chainId].blockConfirmations || 0,
  });

  log("--------------------------------------------------------------------");

  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];
