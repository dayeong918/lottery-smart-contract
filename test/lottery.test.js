const Lottery = artifacts.require("Lottery");
const { assert } = require('chai');
const assertRevert = require('./assertRevert');
const expectEvent = require('./expectEvent');

contract ('Lottery', function([deployer, user1, user2]){ //parameter:accounts 순서대로 들어옴.
    let lottery;
    let betAmount = 5 * 10 ** 15;
    let bet_block_interval = 3;  

    beforeEach(async () => {
        // console.log('Before each') 
        lottery = await Lottery.new(); //배포.
    })

    it('getPot should return current pot', async ()=>{
        let pot = await lottery.getPot();
        assert.equal(pot, 0)
    })

    describe('Bet', function() {
        it('should fail when the bet moeny is not 0.005 ETH', async() => {
            // fail transition
            await assertRevert(lottery.bet('0xab', {from : user1, value: 4000000000000000})); //assertRevert():fail난 transaction의 에러를 try-catch문으로 잡아줌

            // transaction object (chainId, value, to ,from ,gas(Limit), gasPrice)

        })
        it('should put the bet to the bet queue with 1 bet', async() => {
            // bet
            let receipt = await lottery.bet('0xab', {from: user1, value: betAmount})
            // console.log(receipt);
            
            let pot = await lottery.getPot();
            assert.equal(pot, 0);

            // check contract balance == 0.005
            let contractBalance = await web3.eth.getBalance(lottery.address);
            assert.equal(contractBalance, betAmount)

            // check bet info
            let currentBlockNumber = await web3.eth.getBlockNumber();
            let bet = await lottery.getBetInfo(0);
            
            assert.equal(bet.answerBlockNumber, currentBlockNumber + bet_block_interval);
            assert.equal(bet.bettor, user1);
            assert.equal(bet.challenges, '0xab')
            
            // check log : 이벤트가 제대로 찍혔는지
            // console.log(receipt);
            await expectEvent.inLogs(receipt.logs, 'BET'); //BET:event

        })
    })

    describe.only('isMatch', function () {
        let blockHash = '0xab47bd640f31f7ec0fc6861245641f156dd6d363cd3a06010d1e87d3cca7cd1f'
        it('should be BettingResult.Win when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xab', blockHash);  
            assert.equal(matchingResult, 1);
        })

        it('should be BettingResult.Fail when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xcd', blockHash);  
            assert.equal(matchingResult, 0);
        })

        it('should be BettingResult.Draw when two characters match', async () => {
            let matchingResult = await lottery.isMatch('0xaf', blockHash);  
            assert.equal(matchingResult, 2);

            matchingResult = await lottery.isMatch('0xfb', blockHash);  
            assert.equal(matchingResult, 2);
        })
    })
});