const FreeMarket = artifacts.require("FreeMarket");

module.exports = function(deployer) {
  deployer.deploy(FreeMarket)
  .then(async (contract) => {
    await contract.registerProduct('{"name":"Organic","image":"https://raw.githubusercontent.com/weidongli20/Free-market/main/Images/organic.jpg"}');
    await contract.registerProduct('{"name":"South Pole","image":"https://cdn.mos.cms.futurecdn.net/pVqhqw779HUn2JEV9B2ZsX.jpg"}');
    await contract.registerProduct('{"name":"Art 1","image":"https://raw.githubusercontent.com/weidongli20/Free-market/main/Images/art_1.JPG"}');
    await contract.registerProduct('{"name":"Airbnb","image":"https://raw.githubusercontent.com/weidongli20/Free-market/main/Images/anb.JPG"}');
  });
};
