/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV !== 'production'
});
const {PHASE_EXPORT} = require('next/constants');

module.exports = (phase) => withPWA({
	assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
	images: {
		unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT, //Exporting image does not support optimization
		domains: [
			'rawcdn.githack.com',
			'raw.githubusercontent.com'
		]
	},
	env: {
		/* 🔵 - Yearn Finance **************************************************
		** Config over the RPC
		**********************************************************************/
		WEB_SOCKET_URL: {
			1: process.env.WS_URL_MAINNET,
			10: process.env.WS_URL_OPTIMISM,
			250: process.env.WS_URL_FANTOM,
			42161: process.env.WS_URL_ARBITRUM
		},
		JSON_RPC_URL: {
			1: process.env.RPC_URL_MAINNET,
			10: process.env.RPC_URL_OPTIMISM,
			250: process.env.RPC_URL_FANTOM,
			42161: process.env.RPC_URL_ARBITRUM
		},
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		INFURA_KEY: process.env.INFURA_KEY,

		YDAEMON_BASE_URI: 'https://api.ycorpo.com',
		// YDAEMON_BASE_URI: 'https://ydaemon.yearn.finance',
		// YDAEMON_BASE_URI: 'http://localhost:8080',
		BASE_YEARN_ASSETS_URI: 'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/',
		CURVE_BRIBE_V2_ADDRESS: '0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026',
		CURVE_BRIBE_V3_ADDRESS: '0x03dFdBcD4056E2F92251c7B07423E1a33a7D3F6d',
		CURVE_BRIBE_V3_HELPER_ADDRESS: '0xe298eE7278DFDa6Cd67f56c78E79f886E079b305',
		CRV_TOKEN_ADDRESS: '0xD533a949740bb3306d119CC777fa900bA034cd52'
	}
});
