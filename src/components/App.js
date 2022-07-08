import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "./App.css";
import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";
import Main from "./Main";
import Web3 from "web3";

const App = () => {
  const [account, setAccount] = useState("0x0");
  const [loading, setLoading] = useState(true);
  const [daiToken, setDaiToken] = useState({});
  const [dappToken, setDappToken] = useState({});
  const [tokenFarm, setTokenFarm] = useState({});
  const [daiTokenBalance, setDaiTokenBalance] = useState(0);
  const [dappTokenBalance, setDappTokenBalance] = useState(0);
  const [stakingBalance, setStakingBalance] = useState(0);

  const loadWeb3 = async () => {
    // ユーザがMetamaskのアカウントを持っていた場合は、アドレスを取得
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non ethereum browser detected. You should consider trying to install metamask"
      );
    }

    setLoading(false);
  };

  const stakeTokens = (amount) => {
    setLoading(true);
    daiToken.methods
      .approve(tokenFarm._address, amount)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: account })
          .on("transactionHash", (hash) => {
            setLoading(false);
            window.location.reload();
          });
      });
  };

  const unstakeTokens = () => {
    setLoading(true);
    tokenFarm.methods
      .unstakeTokens()
      .send({ from: account })
      .on("transactionHash", (hash) => {
        setLoading(false);
        window.location.reload();
      });
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    console.log("Connected: ", accounts[0]);
    // ユーザがMetamaskを介して接続しているネットワークIDを取得
    const networkId = ethereum.networkVersion;

    const daiTokenData = DaiToken.networks[networkId];
    console.log("daiTokenData: ", daiTokenData);
    if (daiTokenData) {
      // DaiTokenの情報をdaiTokenに格納する
      const _daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      setDaiToken(_daiToken);
      // ユーザのDaiトークンの残高を取得する
      const _daiTokenBalance = await _daiToken.methods
        .balanceOf(accounts[0])
        .call();
      setDaiTokenBalance(_daiTokenBalance);
      console.log("daiTokenBalance: ", _daiTokenBalance.toString());
    } else {
      window.alert("DaiToken contract not deployed to detected network.");
    }

    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      const _dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      setDappToken(_dappToken);
      // ユーザのDappトークン残高を取得する
      const _dappTokenBalance = await _dappToken.methods
        .balanceOf(accounts[0])
        .call();
      setDappTokenBalance(_dappTokenBalance);
      console.log("dappTokenBalance: ", _dappTokenBalance.toString());
    } else {
      window.alert("DappToken contract not deployed to detected network.");
    }

    // tokenFarmDataのデータを取得
    const tokenFarmData = TokenFarm.networks[networkId];
    if (tokenFarmData) {
      const _tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokenFarmData.address
      );
      setTokenFarm(_tokenFarm);
      // tokenFarm内にステーキングされているDaiトークンの残高を取得する
      const _tokenFarmBalance = await _tokenFarm.methods
        .stakingBalance(accounts[0])
        .call();
      setStakingBalance(_tokenFarmBalance);
      console.log("tokenFarmBalance: ", _tokenFarmBalance.toString());
    } else {
      window.alert("TokenFarm contract not deployed to detected network.");
    }
  };

  useEffect(() => {
    (async () => {
      await loadWeb3();
      await loadBlockchainData();
    })();
  }, []);

  return (
    <div>
      <Navbar account={account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mr-auto ml-auto">
              <a
                href="https://unchain-portal.netlify.app/home"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              {loading ? (
                <p id="loader" className="text-center">
                  Loading...
                </p>
              ) : (
                <Main
                  daiTokenBalance={daiTokenBalance}
                  dappTokenBalance={dappTokenBalance}
                  stakingBalance={stakingBalance}
                  stakeTokens={stakeTokens}
                  unstakeTokens={unstakeTokens}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
