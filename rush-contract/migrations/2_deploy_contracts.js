const RushCon = artifacts.require("RushCon");
//const RCToken = artifacts.require("RCToken");

module.exports = function (deployer) {
  deployer.deploy(RushCon);
  //deployer.deploy(RCToken);
};
