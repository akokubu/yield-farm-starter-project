import React, { useRef } from "react";
import dai from "../dai.png";

const Main = ({
  stakingBalance,
  dappTokenBalance,
  daiTokenBalance,
  stakeTokens,
  unstakeTokens,
}) => {
  const inputValue = useRef(0);

  return (
    <div id="content" className="mt-3">
      <table className="table table-borderless text-muted text-center">
        <thead>
          <tr>
            <th scope="col">Staking Balance</th>
            <th scope="col">Reward Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {window.web3.utils.fromWei(stakingBalance.toString(), "Ether")}{" "}
              mDAI
            </td>
            <td>
              {window.web3.utils.fromWei(dappTokenBalance.toString(), "Ether")}{" "}
              DAPP
            </td>
          </tr>
        </tbody>
      </table>
      <div className="card mb-4">
        <div className="card-body">
          <form
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault();
              let amount;
              amount = inputValue.current.value.toString();
              amount = window.web3.utils.toWei(amount, "Ether");
              stakeTokens(amount);
            }}
          >
            <div>
              <label className="float-left">
                <b>Stake Tokens</b>
              </label>
              <span className="float-right text-muted">
                Balance:{" "}
                {window.web3.utils.fromWei(daiTokenBalance.toString(), "Ether")}
              </span>
            </div>
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control fom-control-lg"
                placeholder="0"
                required
                ref={inputValue}
              />
              <div className="input-group-append">
                <img src={dai} height="32" alt="" />
                &nbsp;&nbsp;&nbsp; mDai
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              STAKE!
            </button>
            <button
              type="submit"
              className="btn btn-link btn-block btn-sm"
              onClick={(e) => {
                e.preventDefault();
                unstakeTokens();
                window.location.reload();
              }}
            >
              UN-STAKE...
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Main;
