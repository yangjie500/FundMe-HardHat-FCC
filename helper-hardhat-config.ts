export interface networkConfigItem {
  name: string;
  ethUsdPriceFeedAddress?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: number]: networkConfigItem;
}

const networkConfig: networkConfigInfo = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeedAddress: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    blockConfirmations: 6,
  },
  137: {
    name: "polygon",
    ethUsdPriceFeedAddress: "...",
    blockConfirmations: 6,
  },
  31337: {
    name: "localhost",
  },
};

const developmentChains = ["hardhat", "localhost"];

export { networkConfig, developmentChains };
