// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Cargo Delay Insurance (ERC20 with Delayed Status)
/// @notice ERC20-based insurance paying per delayed day until delivery.
/// @dev Admin updates delivery or delay status; users can claim daily while delayed.

contract CargoDelayInsuranceToken {
    // -------------------- Admin / Token --------------------
    address public admin;
    IERC20 public token;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    uint256 private _lock = 1;
    modifier nonReentrant() {
        require(_lock == 1, "Reentrancy");
        _lock = 2;
        _;
        _lock = 1;
    }

    // -------------------- Parameters --------------------
    uint256 public premiumAmount;
    uint256 public payoutPerDay;
    uint256 public maxPayoutDays;

    // -------------------- Policy --------------------
    struct Policy {
        address insured;
        string containerId;
        uint256 expectedArrival;
        bool active;
        bool delayed;
        bool delivered;
        uint256 actualArrival;
        uint256 claimedDays;
    }

    uint256 public nextPolicyId = 1;
    mapping(uint256 => Policy) private policies;
    mapping(address => uint256[]) private userPolicies;

    // -------------------- Events --------------------
    event PolicyPurchased(uint256 indexed policyId, address indexed insured, string containerId);
    event DeliveryUpdated(uint256 indexed policyId, bool delivered, uint256 actualArrival);
    event DelayStatusSet(uint256 indexed policyId, bool delayed);
    event Claimed(uint256 indexed policyId, address indexed insured, uint256 daysClaimed, uint256 amount);
    event PricingUpdated(uint256 premiumAmount, uint256 payoutPerDay, uint256 maxPayoutDays);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event TokensWithdrawn(address indexed to, uint256 amount);
    event TokensDeposited(address indexed from, uint256 amount);
    event ExpectedArrivalUpdated(uint256 indexed policyId, uint256 oldExpected, uint256 newExpected); // ✅ new

    // -------------------- Constructor --------------------
    constructor(address _token) {
        require(_token != address(0), "token=0");
        token = IERC20(_token);
        admin = msg.sender;

        premiumAmount = 1000000000000000000000; // 1,000 tokens (18 decimals)
        payoutPerDay  = 10000000000000000000;   // 10 tokens per day
        maxPayoutDays = 10;

        emit PricingUpdated(premiumAmount, payoutPerDay, maxPayoutDays);
    }

    // -------------------- Admin Controls --------------------
    function setPricing(uint256 _premiumAmount, uint256 _payoutPerDay, uint256 _maxPayoutDays) external onlyAdmin {
        require(_maxPayoutDays > 0, "maxPayoutDays=0");
        premiumAmount = _premiumAmount;
        payoutPerDay = _payoutPerDay;
        maxPayoutDays = _maxPayoutDays;
        emit PricingUpdated(_premiumAmount, _payoutPerDay, _maxPayoutDays);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "admin=0");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    /// @notice Admin marks container as delayed (enables claims before final delivery)
    function setDelayedStatus(uint256 policyId, bool _delayed) external onlyAdmin {
        Policy storage p = policies[policyId];
        require(p.insured != address(0), "Invalid policy");
        p.delayed = _delayed;
        emit DelayStatusSet(policyId, _delayed);
    }

    /// @notice Admin marks final delivery
    function setDeliveryStatus(uint256 policyId, bool _delivered, uint256 _actualArrival) external onlyAdmin {
        Policy storage p = policies[policyId];
        require(p.insured != address(0), "Invalid policy");
        if (_delivered) {
            require(_actualArrival > 0, "arrival=0");
        }
        p.delivered = _delivered;
        p.actualArrival = _delivered ? _actualArrival : 0;
        if (_delivered) p.delayed = false;
        emit DeliveryUpdated(policyId, _delivered, p.actualArrival);
    }

    /// ✅ New: Admin can update expected arrival date (before delivery)
    function updateExpectedArrival(uint256 policyId, uint256 newExpectedArrival) external onlyAdmin {
        Policy storage p = policies[policyId];
        require(p.insured != address(0), "Invalid policy");
        require(p.active, "Policy inactive");
        require(!p.delivered, "Already delivered");
        //require(newExpectedArrival > block.timestamp, "Expected must be future");

        uint256 oldExpected = p.expectedArrival;
        p.expectedArrival = newExpectedArrival;

        emit ExpectedArrivalUpdated(policyId, oldExpected, newExpectedArrival);
    }

    function withdrawTokens(address to, uint256 amount) external onlyAdmin {
        require(token.transfer(to, amount), "withdraw failed");
        emit TokensWithdrawn(to, amount);
    }

    function depositTokens(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "deposit failed");
        emit TokensDeposited(msg.sender, amount);
    }

    // -------------------- User Methods --------------------
    function buyPolicy(string calldata containerId, uint256 expectedArrival) external returns (uint256 policyId) {
        require(expectedArrival > block.timestamp, "expected must be future");
        require(token.transferFrom(msg.sender, address(this), premiumAmount), "premium transfer failed");

        policyId = nextPolicyId++;
        policies[policyId] = Policy({
            insured: msg.sender,
            containerId: containerId,
            expectedArrival: expectedArrival,
            active: true,
            delayed: false,
            delivered: false,
            actualArrival: 0,
            claimedDays: 0
        });

        userPolicies[msg.sender].push(policyId);
        emit PolicyPurchased(policyId, msg.sender, containerId);
    }

    function claim(uint256 policyId) external nonReentrant {
        Policy storage p = policies[policyId];
        require(p.insured == msg.sender, "Not owner");
        require(p.active, "Inactive");
        require(p.delayed || p.delivered, "Not delayed/delivered");

        uint256 totalDays;
        if (p.delivered) {
            totalDays = _daysDelayed(p.actualArrival, p.expectedArrival);
        } else if (p.delayed) {
            totalDays = _daysDelayed(block.timestamp, p.expectedArrival);
        }

        if (totalDays > maxPayoutDays) totalDays = maxPayoutDays;
        require(totalDays > p.claimedDays, "Nothing to claim");

        uint256 claimableDays = totalDays - p.claimedDays;
        uint256 payout = claimableDays * payoutPerDay;
        require(token.balanceOf(address(this)) >= payout, "insufficient funds");

        p.claimedDays += claimableDays;
        if (p.claimedDays >= maxPayoutDays) p.active = false;

        require(token.transfer(p.insured, payout), "transfer failed");
        emit Claimed(policyId, p.insured, claimableDays, payout);
    }

    // -------------------- View Functions --------------------
    function getPolicy(uint256 policyId)
        external
        view
        returns (
            address insured,
            string memory containerId,
            uint256 expectedArrival,
            bool active,
            bool delayed,
            bool delivered,
            uint256 actualArrival,
            uint256 claimedDays
        )
    {
        Policy storage p = policies[policyId];
        require(p.insured != address(0), "Invalid policy");
        return (
            p.insured,
            p.containerId,
            p.expectedArrival,
            p.active,
            p.delayed,
            p.delivered,
            p.actualArrival,
            p.claimedDays
        );
    }

    function getPoliciesByUser(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    function getUserPolicyCount(address user) external view returns (uint256) {
        return userPolicies[user].length;
    }

    function claimableDays(uint256 policyId) external view returns (uint256) {
        Policy storage p = policies[policyId];
        if (!p.delayed && !p.delivered) return 0;
        uint256 totalDays;
        if (p.delivered) totalDays = _daysDelayed(p.actualArrival, p.expectedArrival);
        else totalDays = _daysDelayed(block.timestamp, p.expectedArrival);
        if (totalDays > maxPayoutDays) totalDays = maxPayoutDays;
        if (totalDays <= p.claimedDays) return 0;
        return totalDays - p.claimedDays;
    }

    function _daysDelayed(uint256 actual, uint256 expected) internal pure returns (uint256) {
        if (actual <= expected) return 0;
        return (actual - expected) / 1 days;
    }
}
