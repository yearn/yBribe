import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {Contract} from 'ethcall';
import {BigNumber} from 'ethers';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {performBatchedUpdates, providers, toAddress} from '@yearn-finance/web-lib/utils';
import {useCurve} from 'contexts/useCurve';
import {allowanceKey} from 'utils';
import CURVE_BRIBE_V2 from 'utils/abi/curveBribeV2.abi';
import CURVE_BRIBE_V3 from 'utils/abi/curveBribeV3.abi';

import type {TCurveGaugeRewards} from 'types/curves.d';

export type	TBribesContext = {
	rewards: TCurveGaugeRewards,
	claimable: TCurveGaugeRewards,
	isLoading: boolean,
	refresh: () => Promise<void>
}
const	defaultProps: TBribesContext = {
	rewards: {},
	claimable: {},
	isLoading: true,
	refresh: async (): Promise<void> => undefined
};

function	getLastThursday(): number {
	const	lastThursday = new Date();
	lastThursday.setDate(lastThursday.getDate() - ((lastThursday.getDay() + 6) % 7) - 3);
	lastThursday.setHours(-22, 0, 0, 0); // Adapt to timezone
	return Math.floor(lastThursday.getTime() / 1000);
}

const	BribesContext = createContext<TBribesContext>(defaultProps);
export const BribesContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{gauges} = useCurve();
	const	{provider, isActive, address} = useWeb3();
	const	[rewards, set_rewards] = useState<TCurveGaugeRewards>({});
	const	[claimable, set_claimable] = useState<TCurveGaugeRewards>({});
	const	[isLoading, set_isLoading] = useState<boolean>(true);
	const	[currentPeriod, set_currentPeriod] = useState<number>(getLastThursday());

	/* 🔵 - Yearn Finance ******************************************************
	**	getSharedStuffFromBribes will help you retrieved some elements from the
	** 	Bribe contracts, not related to the user.
	***************************************************************************/
	const	getSharedStuffFromBribes = useCallback(async (): Promise<void> => {
		const	currentProvider = provider || providers.getProvider(1);
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		const	curveBribeV3Contract = new Contract(process.env.CURVE_BRIBE_V3_ADDRESS as string, CURVE_BRIBE_V3);
		const	[_currentPeriod] = await ethcallProvider.tryAll([curveBribeV3Contract.current_period()]) as [number];	

		set_currentPeriod(_currentPeriod);
	}, [provider]);
	useEffect((): any => getSharedStuffFromBribes(), [getSharedStuffFromBribes]);
	

	/* 🔵 - Yearn Finance ******************************************************
	**	getBribes will call the bribeV2 contract to get all the rewards
	**	per gauge.
	***************************************************************************/
	const getV2Bribes = useCallback(async (): Promise<void> => {
		if (!isActive || !provider || (gauges || []).length === 0) {
			return;
		}
		const	userAddress = '0xd63042a93525f33500c3a5c0387856d5a69bd1ec' || address;
		const	currentProvider = provider || providers.getProvider(1);
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		const	curveBribeV2Contract = new Contract(process.env.CURVE_BRIBE_V2_ADDRESS as string, CURVE_BRIBE_V2);
		const	rewardsPerGaugesCalls = [];
		const	rewardsPerTokensPerGaugesCalls = [];
		const	rewardsList: string[] = [];
		const	_rewards: TCurveGaugeRewards = {};
		const	_claimable: TCurveGaugeRewards = {};
		const	_periods: TCurveGaugeRewards = {};

		for (const gauge of gauges) {
			rewardsPerGaugesCalls.push(curveBribeV2Contract.rewards_per_gauge(gauge.gauge));	
		}

		// get last thursday midnight UTC timestamp
		const	lastThursday = new Date();
		lastThursday.setDate(lastThursday.getDate() - ((lastThursday.getDay() + 6) % 7) - 3);
		lastThursday.setHours(-22, 0, 0, 0); // Adapt to timezone
		const	lastThursdayTimestamp = Math.floor(lastThursday.getTime() / 1000);

		const	_rewardsPerGauges = await ethcallProvider.tryAll(rewardsPerGaugesCalls) as string[][];
		const	rewardsPerGauges = [..._rewardsPerGauges];
		for (const gauge of gauges) {
			const	rewardPerGauge = rewardsPerGauges.shift();
			if (rewardPerGauge && rewardPerGauge.length > 0) {
				if (!gauge.rewardPerGauge) {
					gauge.rewardPerGauge = [];
				}
				gauge.rewardPerGauge.push(...rewardPerGauge);
				for (const tokenAsReward of rewardPerGauge) {
					rewardsList.push(allowanceKey(gauge.gauge, tokenAsReward));
					rewardsPerTokensPerGaugesCalls.push(...[
						curveBribeV2Contract.reward_per_token(gauge.gauge, tokenAsReward),
						curveBribeV2Contract.active_period(gauge.gauge, tokenAsReward),
						curveBribeV2Contract.claimable(userAddress, gauge.gauge, tokenAsReward)

					]);
				}
			}
		}

		const	_rewardsPerTokensPerGaugesWithPeriods = await ethcallProvider.tryAll(rewardsPerTokensPerGaugesCalls) as BigNumber[];
		const	rewardsPerTokensPerGaugesWithPeriods = [..._rewardsPerTokensPerGaugesWithPeriods];
		let	rIndex = 0;
		for (const rewardListKey of rewardsList) {
			const	rewardPerTokenPerGauge = rewardsPerTokensPerGaugesWithPeriods[rIndex++];
			const	periodPerTokenPerGauge = rewardsPerTokensPerGaugesWithPeriods[rIndex++];
			const	claimablePerTokenPerGauge = rewardsPerTokensPerGaugesWithPeriods[rIndex++];
			if (periodPerTokenPerGauge.toNumber() >= lastThursdayTimestamp) {
				if (rewardListKey && rewardPerTokenPerGauge.gt(0)) {
					const	[gauge, token] = rewardListKey.split('_');
					if (!_rewards[toAddress(gauge)]) {
						_rewards[toAddress(gauge)] = {};
					}
					if (!_periods[toAddress(gauge)]) {
						_periods[toAddress(gauge)] = {};
					}
					if (!_claimable[toAddress(gauge)]) {
						_claimable[toAddress(gauge)] = {};
					}
					_rewards[toAddress(gauge)][toAddress(token)] = rewardPerTokenPerGauge;
					_periods[toAddress(gauge)][toAddress(token)] = periodPerTokenPerGauge;
					_claimable[toAddress(gauge)][toAddress(token)] = claimablePerTokenPerGauge;
				}
			}
		}
		performBatchedUpdates((): void => {
			set_rewards(_rewards);
			set_claimable(_claimable);
			set_isLoading(false);
		});
	}, [isActive, provider, gauges, address]);
	useEffect((): any => getV2Bribes(), [getV2Bribes]);



	/* 🔵 - Yearn Finance ******************************************************
	**	getBribes will call the bribeV2 contract to get all the rewards
	**	per gauge.
	***************************************************************************/
	const getRewardsPerGauges = useCallback(async (): Promise<string[][]> => {
		if (!isActive || !provider || (gauges || []).length === 0) {
			return [];
		}
		const	currentProvider = provider || providers.getProvider(1);
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		const	curveBribeV2Contract = new Contract(process.env.CURVE_BRIBE_V2_ADDRESS as string, CURVE_BRIBE_V2);
		const	rewardsPerGaugesCalls = [];

		for (const gauge of gauges) {
			rewardsPerGaugesCalls.push(curveBribeV2Contract.rewards_per_gauge(gauge.gauge));	
		}
		const	_rewardsPerGauges = await ethcallProvider.tryAll(rewardsPerGaugesCalls) as string[][];
		return ([..._rewardsPerGauges]);
	}, [isActive, provider, gauges]);

	// useEffect((): any => {
	// 	const	rewardsPerGauges = getRewardsPerGauges();
	// 	// getV2Bribes()
	// }, [getV2Bribes]);


	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	return (
		<BribesContext.Provider
			value={{
				rewards: rewards || {},
				claimable: claimable || {},
				isLoading: isLoading,
				refresh: async (): Promise<void> => {
					await getV2Bribes();
				}
			}}>
			{children}
		</BribesContext.Provider>
	);
};


export const useBribes = (): TBribesContext => useContext(BribesContext);
export default useBribes;