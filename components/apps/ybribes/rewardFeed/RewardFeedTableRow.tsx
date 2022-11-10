import React, {ReactElement, useMemo} from 'react';
import {BigNumber} from 'ethers';
import {format, toAddress} from '@yearn-finance/web-lib/utils';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import {useCurve} from 'contexts/useCurve';
import {useYearn} from 'contexts/useYearn';
import {TCurveGauges} from 'types/curves.d';
import {TGaugeRewardsFeed} from 'types/gaugesRewards.d';

function	RewardFeedRowItemWithExtraData({
	address,
	value
}: {address: string, value: BigNumber, minDecimals?: number, isV2?: boolean}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	tokenInfo = tokens?.[address];
	const	tokenPrice = Number(prices?.[address]) / 1000000;
	const	decimals = tokenInfo?.decimals || 18;
	const	symbol = tokenInfo?.symbol || '???';
	const	bribeAmount = format.toNormalizedValue(format.BN(value), decimals);
	const	bribeValue = bribeAmount * (Number(tokenPrice || 0));

	return (
		<div className={'flex h-auto flex-col items-end'}>
			<div className={'inline-flex items-baseline text-base tabular-nums text-neutral-900'}>
				{`$ ${format.amount(bribeValue, 2, 2)}`}
			</div>
			<p className={'inline-flex items-baseline text-right text-xs tabular-nums text-neutral-400'}>
				{format.amount(bribeAmount, 2, 2)}
				&nbsp;
				<span>{`${symbol}`}</span>
			</p>
		</div>
	);
}

function	RewardFeedTableRow({currentRewardAdded}: {currentRewardAdded: TGaugeRewardsFeed}): ReactElement {
	const	{gauges} = useCurve();

	const	gaugesObject = useMemo((): {[key: string]: TCurveGauges} => {
		const	_gaugesObject: {[key: string]: TCurveGauges} = {};
		for (const gauge of gauges) {
			_gaugesObject[toAddress(gauge.gauge)] = gauge;
		}
		return _gaugesObject;
	}, [gauges]);

	const	gaugeItem = gaugesObject[toAddress(currentRewardAdded.gauge)];

	return (
		<div className={'grid w-full grid-cols-2 border-t border-neutral-200 px-4 md:grid-cols-3 md:px-10'}>
			
			<div className={'col-span-1 flex h-20 w-full items-center'}>
				<div className={'flex flex-row items-center space-x-4'}>
					<div className={'flex h-6 w-6 rounded-full md:flex md:h-10 md:w-10'}>
						<ImageWithFallback
							alt={''}
							width={40}
							height={40}
							quality={90}
							src={`${process.env.BASE_YEARN_ASSETS_URI}/1/${toAddress(gaugeItem?.swap_token)}/logo-128.png`}
							loading={'eager'} />
					</div>
					<p>{gaugeItem.name}</p>
				</div>
			</div>

			<div className={'col-span-1 flex h-20 w-full justify-end'}>
				<div className={'flex flex-row pt-6'}>
					<p className={'items-baseline text-end text-sm tabular-nums text-neutral-400'}>
						{format.date(Number(currentRewardAdded.timestamp) * 1000)}
					</p>
				</div>
			</div>

			<div className={'col-span-1 flex h-20 w-full justify-end'}>
				<div className={'flex flex-row pt-6'}>
					<label className={'block text-sm leading-6 text-neutral-400 md:hidden'}>{'Current Rewards per veCRV'}</label>
					<RewardFeedRowItemWithExtraData
						address={toAddress(currentRewardAdded.rewardToken)}
						value={format.BN(currentRewardAdded.amount)} />

				</div>
			</div>

		</div>
	);
}

export {RewardFeedTableRow};
