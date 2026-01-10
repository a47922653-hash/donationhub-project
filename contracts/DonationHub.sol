// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationHub is Ownable {

    struct Campaign {
        uint256 id;
        address creator;
        address recipient;
        string title;
        uint256 totalDonated;
        bool active;
    }

    IERC20 public tnc;
    address public feeReceiver;
    uint256 public createFee;
    uint256 public campaignCount;

    mapping(uint256 => Campaign) public campaigns;

    // ===== EVENTS =====
    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed recipient,
        string title
    );

    event Donated(
        uint256 indexed id,
        address indexed donor,
        address indexed recipient,
        uint256 amount
    );

    constructor(
        address _tnc,
        address _feeReceiver,
        uint256 _createFee
    ) Ownable(msg.sender) {
        tnc = IERC20(_tnc);
        feeReceiver = _feeReceiver;
        createFee = _createFee;
    }

    // ===== CREATE CAMPAIGN =====
    function createCampaign(
        string calldata title,
        address recipient
    ) external {
        require(recipient != address(0), "Invalid recipient");

        // tarik fee pembuatan campaign
        require(
            tnc.transferFrom(msg.sender, feeReceiver, createFee),
            "Create fee payment failed"
        );

        campaignCount++;

        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            creator: msg.sender,
            recipient: recipient,
            title: title,
            totalDonated: 0,
            active: true
        });

        emit CampaignCreated(
            campaignCount,
            msg.sender,
            recipient,
            title
        );
    }

    // ===== DONATE =====
    function donate(uint256 campaignId, uint256 amount) external {
        Campaign storage c = campaigns[campaignId];
        require(c.active, "Campaign not active");
        require(amount > 0, "Invalid amount");

        require(
            tnc.transferFrom(msg.sender, c.recipient, amount),
            "Donation failed"
        );

        c.totalDonated += amount;

        emit Donated(
            campaignId,
            msg.sender,
            c.recipient,
            amount
        );
    }

    // ===== ADMIN =====
    function setCreateFee(uint256 newFee) external onlyOwner {
        createFee = newFee;
    }

    function deactivateCampaign(uint256 campaignId) external onlyOwner {
        campaigns[campaignId].active = false;
    }
}
