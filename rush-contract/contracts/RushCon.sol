// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

contract RushCon{
    address chairperson;

    struct matchInfo{
        uint status;
        uint hashOfDetails;
    }

    uint commission = 20;
    mapping (address=>uint) public rewards;
    mapping (address=>matchInfo) public matchDetails;
    mapping (address=>uint) public registered;

    modifier onlyChairperson{
        require(msg.sender == chairperson);
        _;
    }

    modifier onlyUser{
        require(registered[msg.sender] == 1);
        _;
    }

    modifier onlyProvider{
        require(registered[msg.sender] == 2);
        _;
    }

    constructor() payable{
        chairperson = msg.sender;
        payable(address(this)).transfer(msg.value);  // can send some value to the contract initially
    }

    function viewBalance() public view returns(uint) {
        return address(this).balance;
    }

    function viewRewards() public view returns(uint) {
        return rewards[msg.sender];
    }

    function registerUser(address user) public {
        registered[user] = 1;
    }

    function registerProvider(address provider) public {
        registered[provider] = 2;
    }

    function unregister(address member) onlyChairperson public{
        if(chairperson != msg.sender){
            revert();
        }
        registered[member] = 0;
    }

    function requestStream(uint hashOfDetails) onlyUser public{
        matchDetails[msg.sender].status = 0;
        matchDetails[msg.sender].hashOfDetails = hashOfDetails;
    }

    function responseStream(address user, uint hashOfDetails, uint status) onlyProvider public{
        if(registered[user] != 1){
            revert();
        }
        matchDetails[user].status = status;
        matchDetails[user].hashOfDetails = hashOfDetails;
    }

    function confirmPayment(address payable channel) onlyUser payable public{
        uint amount;
        if(registered[channel] != 2){
            revert();
        }
        if(rewards[msg.sender] >= 100){
            amount = 0;
            rewards[msg.sender] = rewards[msg.sender] - 100;
        }
        else{
            amount = (uint)(((100-commission)*msg.value)/100);
            rewards[msg.sender] = rewards[msg.sender] + 10;
        }
        channel.transfer(amount);
    }
}