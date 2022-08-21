import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Contract, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import {
  rewardTokenContractAddress,
  nftContractAddress,
  rewardTokenABI,
  nftABI
} from "../constants";
import { useMoralis } from "react-moralis";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState("0");
  const [contractTokenBalance, setContractTokenBalance] = useState("0");
  const [NFTBalance, setNFTBalance] = useState("0");
  const [mintedNFTS, setMintedNFTS] = useState("0");
  const web3ModalRef = useRef();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const updateRewardTokenBalences = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const rewardTokenContract = new Contract(rewardTokenContractAddress, rewardTokenABI, provider);

      const user = await rewardTokenContract.balanceOf(await provider.getAddress());
      const contract = await rewardTokenContract.balanceOf(rewardTokenContractAddress);

      setUserTokenBalance(utils.formatUnits(user, await rewardTokenContract.decimals()));
      setContractTokenBalance(utils.formatUnits(contract, await rewardTokenContract.decimals()));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      });

      connectWallet();
      updateRewardTokenBalences()
      setInterval(async function () {
        await updateRewardTokenBalences();
      }, 5000);
    }
  }, [walletConnected]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Staking Contract</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <label>WalletConnected: {walletConnected}</label>
      </div>
      <div>
        <label>loading: {loading}</label>
      </div>
      <div>
        <label>userTokenBalance: {userTokenBalance}</label>
      </div>
      <div>
        <label>contractTokenBalance: {contractTokenBalance}</label>
      </div>
      <div>
        <label>NFTBalance: {NFTBalance}</label>
      </div>
      <div>
        <label>mintedNFTS: {mintedNFTS}</label>
      </div>
    </div>
  );
}
