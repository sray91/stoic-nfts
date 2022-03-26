import React, { useEffect, useState } from 'react';
import './styles/App.css';
import { ethers } from 'ethers';
import { Loading } from 'react-loading-dot';
import myEpicNft from './utils/MyEpicNFT.json';
import twitterLogo from './assets/twitter-logo.svg';

const OPENSEA_LINK ='https://testnets.opensea.io/collection/stoicnft-eimjddcifq';
const TOTAL_MINT_COUNT = 55;
const TWITTER_LINK = 'https://twitter.com/Swanagan';
const TWITTER_HANDLE = 'eewatchguy.eth';

// I moved the contract address to the top for easy access.
const CONTRACT_ADDRESS = '0x9905Bf40e406E44f436f60A8b08BfeF667Ac6C1a';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [mintedSoFar, setMintedSoFar] = useState('0');
	const [isLoading, setIsLoading] = useState(false);

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);

			// Setup listener! This is for the case where a user comes to our site
			// and ALREADY had their wallet connected + authorized.
			setupEventListener();
		} else {
			console.log('No authorized account found');
		}
		let chainId = await ethereum.request({ method: 'eth_chainId' });
		console.log('Connected to chain ' + chainId);

		// String, hex code of the chainId of the Rinkebey test network
		const rinkebyChainId = '0x4';
		if (chainId !== rinkebyChainId) {
			alert('You are not connected to the Rinkeby Test Network!');
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);

			// Setup listener! This is for the case where a user comes to our site
			// and connected their wallet for the first time.
			setupEventListener();
		} catch (error) {
			console.log(error);
		}
	};

	// Setup our listener.
	const setupEventListener = async () => {
		// Most of this looks the same as our function askContractToMintNft
		try {
			const { ethereum } = window;

			if (ethereum) {
				// Same stuff again
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				);

				// THIS IS THE MAGIC SAUCE.
				// This will essentially "capture" our event when our contract throws it.
				// If you're familiar with webhooks, it's very similar to that!
				connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
					console.log(from, tokenId.toNumber());
					alert(
						`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
					);
				});

				console.log('Setup event listener!');
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const askContractToMintNft = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				);

        setIsLoading(true);
				console.log('Going to pop wallet now to pay gas...');
				let nftTxn = await connectedContract.makeAnEpicNFT();

				console.log('Mining...please wait.');
				await nftTxn.wait();
				console.log(nftTxn);
				console.log(
					`Mined, see transaction: https://rinkeby.etherscan.io/tx/${
						nftTxn.hash
					}`
				);
        setIsLoading(false);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getTotalNFTsMintedSoFar = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNft.abi,
					signer
				);
				let nft = await connectedContract.getTotalNFTsMintedSoFar();
				setMintedSoFar(nft.toNumber());
			}
			else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch(error) {
			console.log(error);
		}
	}
	
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	const renderNotConnectedContainer = () => (
		<button
			onClick={connectWallet}
			className="cta-button connect-wallet-button"
		>
			Connect to Wallet
		</button>
	);

	const fireSomeFunctions = () => (
		askContractToMintNft(), getTotalNFTsMintedSoFar()
	);

	const renderMintUI = () => (
		<button
			onClick={fireSomeFunctions}
			className="cta-button connect-wallet-button"
		>
			Mint NFT
		</button>
	);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">Stoic Traits NFT</p>
					<p className="sub-text">
						Each unique. Each stoic. Discover your NFT today.
					</p>
					{currentAccount === ''
						? renderNotConnectedContainer()
						: renderMintUI()}
				</div>
				<div className="body-container">
					<p className="body-text">{`${mintedSoFar}/${TOTAL_MINT_COUNT} NFTs minted so far!`}</p>
				</div>
				<div>
					<button className="cta-button connect-wallet-button">
						<a className="body-text" href={OPENSEA_LINK} target="_blank">
							🌊 View Collection on OpenSea
						</a>
					</button>
				</div>
        <div>
          <div>{isLoading ? <Loading /> : ``}</div>
        </div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`@${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
