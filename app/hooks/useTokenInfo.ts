import {useEffect, useState} from 'react';
import {erc20ABI, useContractReads} from 'wagmi';
import {useYearn} from '@yearn-finance/web-lib/contexts/useYearn';

import type {TAddress} from '@builtbymom/web3/types/address';

function useTokenInfo(address: TAddress): {symbol: string; decimals: number; price: number; init: boolean} {
	const {tokens, prices} = useYearn();
	const [token, set_token] = useState<{symbol: string; decimals: number; price: number; init: boolean}>({
		symbol: '',
		decimals: 18,
		price: 0,
		init: false
	});

	useEffect(() => {
		const tokenInfo = tokens?.[address];
		const tokenPrice = Number(prices?.[address]) / 1e6;
		const decimals = tokenInfo?.decimals || 18;
		const symbol = tokenInfo?.symbol || '';
		set_token({symbol, decimals, price: tokenPrice, init: true});
	}, [address, prices, tokens]);

	const {data: updatedTokenData} = useContractReads({
		enabled: token.init && token.symbol === '',
		contracts: [
			{abi: erc20ABI, address, functionName: 'symbol'},
			{abi: erc20ABI, address, functionName: 'decimals'}
		]
	});

	return {
		symbol: token.symbol || updatedTokenData?.[0].result || '',
		decimals: token.decimals,
		price: token.price,
		init: token.init
	};
}

export {useTokenInfo};
