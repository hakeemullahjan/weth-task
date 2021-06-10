import React, { useState, useEffect } from "react";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import Web3 from "web3";
import { contract_Add, abi } from "./blockchain/constant";

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
    56, //bsc mainnet
    97, //bsc testnet
    80001, //Mumbai Testnet,
    137, //Mumbai Mainnet
  ],
});

const getLibrary = (provider) => {
  return new Web3(provider);
};

const Wallet = () => {
  const { chainId, account, activate, active } = useWeb3React();
  const [eth, setEth] = useState(0);
  const [web3, setweb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [ethBalance, setEthBalance] = useState(0);
  const [wethBalance, setWethBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    activate(injectedConnector);
  };

  useEffect(() => {
    if (active) {
    //   const web3js = new Web3(
    //  windows
    //   );
      const web3js = new Web3(
        new Web3.providers.HttpProvider(
          "https://rinkeby.infura.io/v3/3677788ecbb042f3b941ddd26dc8fc08"
        )
      );
      console.log("WEB", web3js);
      setweb3(web3js);
      const contractjs = new web3js.eth.Contract(abi, contract_Add);
      setContract(contractjs);
      getEthBalance(web3js);
      getWethBalance(web3js, contractjs);
    }
  }, [active]);

  const getEthBalance = async (web3) => {
    const balanceEth = await web3.eth.getBalance(account);
    const bEth = web3.utils.fromWei(balanceEth);
    setEthBalance(bEth);
  };

  const getWethBalance = async (web3, contract) => {
    let balance = await contract.methods.balanceOf(account).call();
    const b = web3.utils.fromWei(balance);
    setWethBalance(b);
  };

  const onDeposit = async () => {
    setLoading(true);
    console.log("contract", contract.methods);
    
    await contract.methods
      .deposit()
      .send({ from: account, value: web3.utils.toWei(eth.toString()) })
      .on("transactionHash", (hash) => {
        // hash of tx
        console.log("hash", hash);
      })
      .on("confirmation", function (confirmationNumber, receipt) {
        if (confirmationNumber === 2) {
          console.log("confirmationNumber", confirmationNumber);
          getEthBalance(web3);
          getWethBalance(web3, contract);
          setEth(0);
          setLoading(false);
        }
      })
      .on("error", function (err) {
        console.log("error", err);
        setLoading(false);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <div>ChainId: {chainId}</div>
        <div>Account: {account}</div>
        {active ? (
          <>
            <div>✅ </div>
            <div>Eth balance: {ethBalance} </div>
            <div>Weth balance: {wethBalance} </div>

            {loading ? <p>Loading.........</p> : null}

            <input
              type="number"
              placeholder="Enter eth"
              onChange={(e) => setEth(e.target.value)}
              value={eth}
            />
            <button type="button" onClick={onDeposit}>
              Deposit
            </button>
          </>
        ) : (
          <button type="button" onClick={onClick}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Wallet />
    </Web3ReactProvider>
  );
};

export default App;
