// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.0;
// Imports

// Errors
import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();

// Interfaces, Library, Contracts

/** @title A contract for crowdfunding 
    @author Edberg
    @notice This contract is a demo a fund me contract
    @dev This implements price feed as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;
    // State Variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmtFunded;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Not the owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // Functions order:
    // constructor, receive, fallback, external, public, internal, private, view/pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feed as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_funders.push(msg.sender);
        s_addressToAmtFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length; // Reading a storage variable costs 800 gas
            funderIndex++
        ) {
            address funder = s_funders[funderIndex]; // Reading a storage costs alot
            s_addressToAmtFunded[funder] = 0;
        }
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess == true, "Transaction Failed");
        s_funders = new address[](0);
    }

    function cheaperWithdraw() public onlyOwner {
        // Store it in memory then read it
        // Note: Mappings can't be in memory...
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmtFunded[funder] = 0;
        }
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess == true, "Transaction Failed");
        s_funders = new address[](0);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmtFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
