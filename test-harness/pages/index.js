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

  const sendTokensToContract = async () => {
    setLoading(true)
    const provider = await getProviderOrSigner(true);
    const contract = new Contract(
      rewardTokenContractAddress,
      rewardTokenABI,
      provider
    );

    setLoading(true)
    try {
      const tx = await contract.transfer(rewardTokenContractAddress, utils.parseEther("100"));
      await tx.wait();
    }
    catch {
      window.alert("Failed to send tokens.")
    }
    setLoading(false)
  };

  const updateNFTBalances = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const contract = new Contract(nftContractAddress, nftABI, provider);

      const userBalance = await contract.balanceOf(await provider.getAddress());
      const contractBalance = await contract.tokenId();

      setNFTBalance(utils.formatEther(userBalance, 0));
      setMintedNFTS(utils.formatEther(contractBalance, 0));
    } catch (err) {
      console.error(err);
    }
  }

  const mint = async () => {
    setLoading(true)
    const provider = await getProviderOrSigner(true);
    const contract = new Contract(
      nftContractAddress,
      nftABI,
      provider
    );

    if (await contract.tokenId() < await contract.maxTokenIds()) {
      setLoading(true)
      try {
        const tx = await contract.mint({
          value: await contract.price(),
        })
        await tx.wait()
      }
      catch {
        window.alert("Failed to mint NFT.")
      }
      setLoading(false)
    } else {
      window.alert("All NFTs have been minted")
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

  const updateTokenBalances = async () => {
    try {
      const provider = await getProviderOrSigner(true);
      const contract = new Contract(rewardTokenContractAddress, rewardTokenABI, provider);

      const userBalance = await contract.balanceOf(await provider.getAddress());
      const contractBalance = await contract.balanceOf(rewardTokenContractAddress);

      setUserTokenBalance(utils.formatUnits(userBalance, await contract.decimals()));
      setContractTokenBalance(utils.formatUnits(contractBalance, await contract.decimals()));
    } catch (err) {
      console.error(err);
    }
  }

  const Button = ({ title, onClick }) => {
    return <button disabled={loading ? "disabled" : ""} onClick={loading ? function () { } : onClick}>{title}</button>
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      });

      connectWallet();
      updateTokenBalances()
      updateNFTBalances();

      setInterval(async function () {
        await updateTokenBalances();
        await updateNFTBalances();
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
        <label>WalletConnected: {walletConnected ? "true" : "false"}</label>
      </div>
      <div>
        <label>loading: {loading ? "true" : "false"}</label>
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
      <div>
        <Button title={"Mint"} onClick={mint} />
        <Button title={"Send 100 to contract"} onClick={sendTokensToContract} />
        <Button title={"Connect"} onClick={connectWallet} />
      </div>
    </div>
  );
}
