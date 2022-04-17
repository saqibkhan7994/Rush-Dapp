// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

contract RushCon{
    address chairperson;

    struct matchInfo{
        uint status;
        uint matchNumber;
        uint matchDuration;
    }

    struct providers{
        uint numProviders;
        mapping (uint =>address) providerList;
    }

    providers allProviders;

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

    function viewCommission() public view onlyChairperson returns(uint) {
        return address(this).balance;
    }

    function viewRewards() public view onlyUser returns(uint) {
        return rewards[msg.sender];
    }

    function getProviders() public view returns(address[] memory){
        address[] memory addressArray = new address[](allProviders.numProviders);
        for(uint i = 0; i < allProviders.numProviders; i++) {
            addressArray[i] = allProviders.providerList[i];
        }
        return addressArray;
    }

    function registerUser(address user) public {
        registered[user] = 1;
    }

    function registerProvider(address provider) public {
        registered[provider] = 2;
        allProviders.providerList[allProviders.numProviders++] = provider;
    }

    function unregister(address member) onlyChairperson public{
        if(chairperson != msg.sender){
            revert();
        }
        if(registered[member] == 0){
            revert();
        }
        if(registered[member] == 2){
            for(uint i = 0; i < allProviders.numProviders; i++) {
                if(allProviders.providerList[i] == member){
                    delete allProviders.providerList[i];
                }
            }
            allProviders.numProviders--;
        }
        registered[member] = 0;
    }

    function requestStream(uint matchId, uint duration) onlyUser public{
        matchDetails[msg.sender].status = 0;
        matchDetails[msg.sender].matchNumber = matchId;
        matchDetails[msg.sender].matchDuration = duration;
    }

    function responseStream(address user, uint status) onlyProvider public{
        if(registered[user] != 1){
            revert();
        }
        matchDetails[user].status = status;
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