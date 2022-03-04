const Migrations = artifacts.require("Migrations"); //build folder의 Migrations 파일의 데이터를 가져옴.

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
