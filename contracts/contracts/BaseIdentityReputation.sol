// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseIdentityReputation {
    struct Profile {
        bool registered;
        string metadataURI;
        uint256 reputation;
    }

    mapping(address => Profile) private profiles;
    mapping(address => mapping(address => uint256)) public givenReputation;

    event Registered(address indexed user, string metadataURI);
    event MetadataUpdated(address indexed user, string metadataURI);
    event ReputationGiven(address indexed from, address indexed to, uint256 amount);

    modifier onlyRegistered() {
        require(profiles[msg.sender].registered, "Not registered");
        _;
    }

    function register(string calldata metadataURI) external {
        require(!profiles[msg.sender].registered, "Already registered");
        profiles[msg.sender] = Profile({
            registered: true,
            metadataURI: metadataURI,
            reputation: 0
        });
        emit Registered(msg.sender, metadataURI);
    }

    function updateMetadata(string calldata metadataURI) external onlyRegistered {
        profiles[msg.sender].metadataURI = metadataURI;
        emit MetadataUpdated(msg.sender, metadataURI);
    }

    function giveReputation(address to, uint256 amount) external onlyRegistered {
        require(to != address(0), "Invalid to");
        require(to != msg.sender, "Cannot give to self");
        require(amount > 0, "Amount must be > 0");

        uint256 alreadyGiven = givenReputation[msg.sender][to];
        require(alreadyGiven + amount <= 100, "Reputation limit reached");

        givenReputation[msg.sender][to] = alreadyGiven + amount;
        profiles[to].reputation += amount;

        emit ReputationGiven(msg.sender, to, amount);
    }

    function getProfile(address user)
        external
        view
        returns (
            bool registered,
            string memory metadataURI,
            uint256 reputation
        )
    {
        Profile memory p = profiles[user];
        return (p.registered, p.metadataURI, p.reputation);
    }

    function isRegistered(address user) external view returns (bool) {
        return profiles[user].registered;
    }

    function reputationOf(address user) external view returns (uint256) {
        return profiles[user].reputation;
    }
}
