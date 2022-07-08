const DappToken = artifacts.require(`DappToken`);
const DaiToken = artifacts.require(`DaiToken`);
const TokenFarm = artifacts.require(`TokenFarm`);

// chaiのテストライブラリ・フレームワークを読み込む
const { assert } = require("chai");
require(`chai`)
  .use(require(`chai-as-promised`))
  .should();

// 任意のETHを値をWeiに変換する関数
const token = (n) => {
  return web3.utils.toWei(n, "ether");
};

contract("TokenFarm", ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    // コントラクトの読み込み
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // すべてのDappトークンをファームに移動する(1 million)
    await dappToken.transfer(tokenFarm.address, token("1000000"));

    await daiToken.transfer(investor, token("100"), { from: owner });
  });

  // DaiToken
  describe("Mock DAI deployment", async () => {
    // テスト1
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  // DappToken
  describe("Dapp deployment", async () => {
    // テスト1
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });

  // TokenFarm
  describe("TokenFarm deployment", async () => {
    // テスト3
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp Token Farm");
    });

    // テスト4
    it("contract has tokens", async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), token("1000000"));
    });
  });

  describe("Farming tokens", async () => {
    it("rewards investors for staking mDai tokens", async () => {
      let result;
      // テスト5. ステーキングの前に投資家の残高を確認する
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        token("100"),
        "investor Mock DAI wallet balance correct before staking"
      );

      // テスト6. 偽のDAIトークンを確認する
      await daiToken.approve(tokenFarm.address, token("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(token("100"), { from: investor });

      // テスト7. ステーキング後の投資家の残高を確認する
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        token("0"),
        "investor Mock DAI wallet balance correct after staking"
      );

      // テスト8. ステーキング後のTokenFarmの残高を確認する
      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        token("100"),
        "Token Farm Mock DAI balance correct after staking"
      );

      // テスト9. 投資家がTokenFarmにステーキングした残高を確認する
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        token("100"),
        "investor staking balance correct after staking"
      );

      // テスト10. ステーキングを行った投資家の状態を確認する
      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "true",
        "investor staking status correct after staking"
      );

      // トークンを発行する
      await tokenFarm.issueTokens({ from: owner });

      // トークンを発行した後の投資家の Dapp 残高を確認する
      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        token("100"),
        "investor Dapp Token wallet balance correct after staking"
      );

      // ownerのみがトークンを発行できることを確認する（もしowner以外の人がトークンを発行しようとした場合、却下される）
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // トークンをアンステーキングする
      await tokenFarm.unstakeTokens({ from: investor });

      // テスト11. アンステーキングの結果を確認する
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        token("100"),
        "investor Mock DAI wallet balance correct after staking"
      );

      // テスト12. 投資家がアンステーキングした後の Token Farm 内に存在する偽の Dai 残高を確認する
      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        token("0"),
        "Token Farm Mock DAI wallet balance correct after staking"
      );

      // テスト13. 投資家がアンステーキングした後に投資家の残高を確認する
      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        token("0"),
        "investor staking balance correct after staking"
      );

      // テスト14. 投資家がアンステーキングした後の投資家の状態を確認
      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        "false",
        "investor staking status correct after staking"
      );
      result = await tokenFarm.hasStaked(investor);
      assert.equal(
        result.toString(),
        "true",
        "investor staking status correct after staking"
      );
    });
  });
});
