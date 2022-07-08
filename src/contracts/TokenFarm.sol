pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./MockDaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    // 7. これまでにステーキングを行ったすべてのアドレスを追跡する配列を作成
    address[] public stakers;

    // 4. 投資家のアドレスと彼らのステーキングしたトークンの量を紐つける mapping を作成
    mapping(address => uint256) public stakingBalance;

    // 6.投資家のアドレスとをもとに彼らがステーキングを行ったか否かを紐つける mapping を作成
    mapping(address => bool) public hasStaked;

    // 10. 投資家の最新のステータスを記録するマッピングを作成
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1.ステーキング機能を作成する
    function stakeTokens(uint256 _amount) public {
        // 2. ステーキングされるトークンが0以上あることを確認
        require(_amount > 0, "amount can't be 0");
        // 3. 投資家のトークンを TokenFarmコントラクトに移動させる
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // 5. ステーキングされたトークンの残高を更新する
        stakingBalance[msg.sender] += _amount;

        // 8. 投資家がまだステークしていない場合のみ、彼らをstakers配列に追加する
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // 9. ステーキングステータスの更新
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // 2. トークンの発行機能
    function issueTokens() public {
        // Dapp トークンを発行できるのはあなたのみであることを確認する
        require(msg.sender == owner, "caller must be the owner");

        // 投資家が預けた偽Daiトークンの数を確認し、同量のDappトークンを発行する
        for (uint256 i = 0; i < stakers.length; i++) {
            // recipient は Dapp トークンを受け取る投資家
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

    // 3. アンステーキング機能
    // * 投資家は、預け入れた Dai を引き出すことができる
    function unstakeTokens() public {
        // 投資家がステーキングした金額を取得する
        uint256 balance = stakingBalance[msg.sender];
        // 投資家がステーキングした金額が0以上であることを確認する
        require(balance > 0, "staking balance cannot be 0");
        // 偽の Dai トークンを投資家に返金する
        daiToken.transfer(msg.sender, balance);
        // 投資家のステーキング残高を0に更新する
        stakingBalance[msg.sender] = 0;
        // 投資家のステーキング状態を更新する
        isStaking[msg.sender] = false;
    }
}
