import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Contract} from 'ethcall';
import {BigNumber} from 'ethers';
import axios from 'axios';
import useSWR from 'swr';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {providers, toAddress} from '@yearn-finance/web-lib/utils';
import {allowanceKey} from 'utils';
import CURVE_BRIBE_V2 from 'utils/abi/curveBribeV2.abi';

import type {TCurveGaugeRewards, TCurveGauges} from 'types/curves.d';

export type	TCurveContext = {
	gauges: TCurveGauges[],
	rewards: TCurveGaugeRewards,
	claimable: TCurveGaugeRewards,
	refresh: () => Promise<void>
}
const	defaultProps: TCurveContext = {
	gauges: [],
	rewards: {},
	claimable: {},
	refresh: async (): Promise<void> => undefined
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const curveBaseFetcher = async (url: string): Promise<any> => axios.get(url).then((res): any => res.data?.data || {});

const	CurveContext = createContext<TCurveContext>(defaultProps);
export const CurveContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	const	{provider, isActive, address} = useWeb3();
	const	[rewards, set_rewards] = useState<TCurveGaugeRewards>({});
	const	[claimable, set_claimable] = useState<TCurveGaugeRewards>({});
	
	/* 🔵 - Yearn Finance ******************************************************
	**	Fetch the gauges from Curve Finance 
	***************************************************************************/
	const	{data: gaugesWrapper} = useSWR('https://api.curve.fi/api/getGauges?blockchainId=ethereum', curveBaseFetcher);
	const	gauges = useMemo((): TCurveGauges[] => {
		const	_gaugesForMainnet: TCurveGauges[] = [];
		for (const gauge of Object.values(gaugesWrapper?.gauges || {})) {
			const	currentGauge = gauge as TCurveGauges;
			if (currentGauge.is_killed) {
				continue;
			}
			if (currentGauge.side_chain) {
				continue;
			}
			_gaugesForMainnet.push(currentGauge);
		}
		return _gaugesForMainnet;
	}, [gaugesWrapper]);

	const getExtraData = useCallback(async (): Promise<void> => {
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

		// const	_gauges = gauges.filter((gauge): boolean => toAddress(gauge.gauge) === toAddress('0x7ca5b0a2910B33e9759DC7dDB0413949071D7575'));
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
		set_rewards(_rewards);
		set_claimable(_claimable);
	}, [isActive, provider, gauges, address]);
	useEffect((): void => {
		getExtraData();
	}, [getExtraData]);


	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	return (
		<CurveContext.Provider
			value={{
				gauges: gauges || [],
				rewards: rewards || {},
				claimable: claimable || {},
				refresh: async (): Promise<void> => {
					await getExtraData();
				}
			}}>
			{children}
		</CurveContext.Provider>
	);
};


export const useCurve = (): TCurveContext => useContext(CurveContext);
export default useCurve;