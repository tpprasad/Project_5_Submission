const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {

    // 1. create a Star with different tokenId
    let _tokenId = 10;
    let _starName = 'Star10';
    let _instance = await StarNotary.deployed();
    await _instance.createStar(_starName, _tokenId, {from: accounts[0]});
    
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let _tokenName = await _instance.name();
    let _tokenSymbol = await _instance.symbol();
    assert.equal(_tokenName, 'Udacity StarNotary Token');
    assert.equal(_tokenSymbol, 'SNC');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let _tokenId1 = 11;
    let _starName1 = 'Star11';
    let _user1 = accounts[0];
    let _tokenId2 = 12;
    let _starName2 = 'Star12';
    let _user2 = accounts[1];

    let _instance = await StarNotary.deployed();
    await _instance.createStar(_starName1, _tokenId1, {from: _user1});
    await _instance.createStar(_starName2, _tokenId2, {from: _user2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await _instance.exchangeStars(_tokenId1, _tokenId2, {from: _user1});

    // 3. Verify that the owners changed
    assert.equal(await _instance.ownerOf(_tokenId1), _user2);
    assert.equal(await _instance.ownerOf(_tokenId2), _user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let _tokenId = 13;
    let _starName = 'Star13';
    let _user1 = accounts[0];
    let _user2 = accounts[1];
    let _instance = await StarNotary.deployed();
    await _instance.createStar(_starName, _tokenId, {from: _user1});
    // 2. use the transferStar function implemented in the Smart Contract
    await _instance.transferStar(_user2, _tokenId, {from: _user1});
    // 3. Verify the star owner changed.
    assert.equal(await _instance.ownerOf(_tokenId), _user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let _tokenId = 14;
    let _starName = 'Star14';
    let _instance = await StarNotary.deployed();
    await _instance.createStar(_starName, _tokenId, {from: accounts[1]});

    // 2. Call your method lookUptokenIdToStarInfo
    let _retStarName = await _instance.lookUptokenIdToStarInfo(_tokenId, {from: accounts[1]});

    // 3. Verify if you Star name is the same
    assert.equal(_retStarName, _starName);

});