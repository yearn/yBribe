import React, {ChangeEvent, ReactElement, ReactNode, useCallback, useMemo, useState} from 'react';
import Image from 'next/image';
import {Contract} from 'ethcall';
import {BigNumber, ethers} from 'ethers';
import useSWR from 'swr';
import {Button} from '@yearn-finance/web-lib/components';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {ABI, defaultTxStatus, format, isZeroAddress, performBatchedUpdates, providers, toAddress} from '@yearn-finance/web-lib/utils';
import {GaugeTableEmpty} from 'components/apps/ybribes/bribe/GaugeTableEmpty';
import {GaugeTableHead} from 'components/apps/ybribes/bribe/GaugeTableHead';
import {GaugeTableRow} from 'components/apps/ybribes/bribe/GaugeTableRow';
import {DropdownGauges, TDropdownGaugeOption} from 'components/TokenDropdownGauges';
import {useBribes} from 'contexts/useBribes';
import {useCurve} from 'contexts/useCurve';
import {useYearn} from 'contexts/useYearn';
import {TCurveGauges, TKeyStringBN} from 'types/curves.d';
import {getCounterValue} from 'utils';

import type {TNormalizedBN} from 'types/types.d';

const	defaultOption: TDropdownGaugeOption = {
	label: '',
	value: {}
};

function	GaugeRowItemWithExtraData({address, value}: {address: string, value: BigNumber}): ReactElement {
	const	{tokens, prices} = useYearn();

	const	tokenInfo = tokens?.[address];
	const	tokenPrice = prices?.[address];
	const	decimals = tokenInfo?.decimals || 18;
	const	symbol = tokenInfo?.symbol || '???';
	const	bribeAmount = format.toNormalizedValue(format.BN(value), decimals);
	const	bribeValue = bribeAmount * (Number(tokenPrice || 0) / 1000000);

	return (
		<div className={'flex flex-col'}>
			<div className={'flex w-full flex-row items-center justify-between'}>
				<p className={'text-base tabular-nums text-neutral-900'}>
					{`${symbol}`}
				</p>
				<p className={'text-base tabular-nums text-neutral-900'}>
					{format.amount(bribeAmount, 2, 2)}
				</p>
			</div>
			<div className={'flex w-full flex-row items-center justify-end'}>
				<p className={'inline-flex items-baseline text-right text-sm tabular-nums text-neutral-400'}>
					{`$ ${format.amount(bribeValue, 2, 2)}`}
				</p>
			</div>
		</div>
	);
}

function	GaugeList(): ReactElement {
	const	{gauges} = useCurve();
	const	[category, set_category] = useState('all');

	const	filteredGauges = useMemo((): TCurveGauges[] => {
		if (category === 'factory') {
			return gauges.filter((gauge): boolean => gauge.factory);
		}
		return gauges.filter((gauge): boolean => !gauge.factory);
	}, [category, gauges]);

	const	sortedGauges = useMemo((): TCurveGauges[] => {
		const	gaugesToSort = [...filteredGauges];
		return gaugesToSort;
	}, [filteredGauges]);
	
	return (
		<section className={'mt-4 mb-20 grid w-full grid-cols-12 pb-10 md:mb-40 md:mt-20'}>
			<div className={'col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'flex flex-row items-center justify-between px-4 pt-4 pb-2 md:px-10 md:pt-10 md:pb-8'}>
					<div>
						<h2 className={'text-lg font-bold md:text-3xl'}>
							{`${category === 'factory' ? 'f-' : 'All '}Gauges`}
						</h2>
					</div>
					<div className={'flex flex-row space-x-4'}>
						<Button
							onClick={(): void => set_category('all')}
							variant={category === 'all' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'All'}
						</Button>
						<Button
							onClick={(): void => set_category('factory')}
							variant={category === 'factory' ? 'filled' : 'outlined'}
							className={'yearn--button-smaller'}>
							{'Factory'}
						</Button>
					</div>
				</div>
				<div className={'grid w-full grid-cols-1 pb-2 md:pb-4'}>
					<GaugeTableHead />
					{sortedGauges.length === 0 ? (
						<GaugeTableEmpty category={category} />
					) : sortedGauges.map((gauge): ReactNode => {
						if (!gauge) {
							return (null);
						}
						return <GaugeTableRow key={gauge.name} currentGauge={gauge} />;
					})}
				</div>
			</div>
		</section>
	);
}

function	NewVault(): ReactElement {
	const	{address, provider, isActive} = useWeb3();
	const	{currentRewards} = useBribes();
	const	{gauges} = useCurve();
	const	[selectedOption, set_selectedOption] = useState(defaultOption);
	const	[amount] = useState<TNormalizedBN>({raw: ethers.constants.Zero, normalized: 0});
	const	[tokenAddress, set_tokenAddress] = useState<string>('');
	const	[txStatusApprove] = useState(defaultTxStatus);
	const	[txStatusZap] = useState(defaultTxStatus);
	const	allowanceFrom = 0;

	const	gaugesOptions = useMemo((): TDropdownGaugeOption[] => {
		return (
			gauges
				.map((gauge: TCurveGauges): TDropdownGaugeOption => ({
					label: gauge.name,
					icon: (
						<div className={'hidden h-6 w-6 rounded-full md:flex'}>
							<Image
								alt={''}
								width={24}
								height={24}
								quality={90}
								src={`${process.env.BASE_YEARN_ASSETS_URI}/1/${toAddress(gauge.swap_token)}/logo-128.png`}
								loading={'eager'} />
						</div>
					),
					value: gauge
				})
				));
	}, [gauges]);

	const	rewardsForCurrentGauge = useMemo((): TKeyStringBN => {
		if (!selectedOption.value) {
			return {};
		}
		return currentRewards[toAddress(selectedOption.value.gauge)];
	}, [selectedOption.value, currentRewards]);
	const	rewardsForCurrentGaugeMap = Object.entries(rewardsForCurrentGauge || {}) || [];

	const expectedOutFetcher = useCallback(async (
		_tokenAddress: string
	): Promise<{
		name: string;
		symbol: string;
		decimals: number;
		raw: BigNumber,
		normalized: number
	}> => {
		const	currentProvider = provider || providers.getProvider(1);
		const	ethcallProvider = await providers.newEthCallProvider(currentProvider);
		const	erc20Contract = new Contract(_tokenAddress, ABI.ERC20_ABI);

		const	[name, symbol, decimals, balance] = await ethcallProvider.tryAll([
			erc20Contract.name(),
			erc20Contract.symbol(),
			erc20Contract.decimals(),
			erc20Contract.balanceOf(address)
		]) as [string, string, number, BigNumber];

		return ({
			name,
			symbol,
			decimals,
			raw: balance,
			normalized: format.toNormalizedValue(balance, decimals)
		});
	}, [address, provider]);

	/* 🔵 - Yearn Finance ******************************************************
	** SWR hook to get the expected out for a given in/out pair with a specific
	** amount. This hook is called every 10s or when amount/in or out changes.
	** Calls the expectedOutFetcher callback.
	**************************************************************************/
	const	{data: selectedToken} = useSWR(isActive && !isZeroAddress(tokenAddress) ? [toAddress(tokenAddress)] : null, expectedOutFetcher, {refreshInterval: 10000, shouldRetryOnError: false});

	function renderButton(): ReactElement {
		if (txStatusApprove.pending || amount.raw.gt(allowanceFrom)) {
			return (
				<Button
					// onClick={onApproveFrom}
					className={'w-full'}
					isBusy={txStatusApprove.pending}
					isDisabled={!isActive || amount.raw.isZero()}>
					{`Approve ${selectedOption?.value?.name || 'token'}`}
				</Button>
			);
		}

		return (
			<Button
				// onClick={onZap}
				className={'w-full'}
				isBusy={txStatusZap.pending}
				isDisabled={!isActive || amount.raw.isZero()}>
				{'Deposit'}
			</Button>
		);
	}

	return (
		<>

			<div className={'mx-auto block w-full bg-neutral-100 p-4 md:p-10'}>
				<div className={'relative z-20 col-span-6 flex flex-col space-y-1'}>
					<div className={'mb-4'}>
						<b className={'text-3xl text-neutral-900'}>{'Bribe a Gauge'}</b>
						<p className={'pt-4'}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}</p>
					</div>
				</div>
				<div className={'mt-10 grid grid-cols-12 gap-4'}>
					<div className={'relative z-20 col-span-4 flex flex-col space-y-1'}>
						<label className={'relative z-20 flex flex-col space-y-1'}>
							<p className={'text-base text-neutral-600'}>
								{'Gauge'}
							</p>
							<DropdownGauges
								defaultOption={defaultOption}
								placeholder={'0x...'}
								options={gaugesOptions}
								selected={selectedOption}
								onSelect={(option: TDropdownGaugeOption): void => {
									performBatchedUpdates((): void => {
										set_selectedOption(option);
									});
								}} />
						</label>
						<div className={`pt-6 ${rewardsForCurrentGaugeMap.length === 0 ? 'pointer-events-none opacity-0' : ''}`}>
							<p className={'text-sm text-neutral-600'}>{'Active Bribes'}</p>
							<div className={'mt-1 flex flex-col space-y-2 bg-neutral-0/20 p-4'}>
								{
									rewardsForCurrentGaugeMap.map(([key, value]: [string, BigNumber]): ReactElement => (
										<GaugeRowItemWithExtraData
											key={`rewards-${selectedOption?.value?.gauge}-${key}`}
											address={toAddress(key)}
											value={value} />
									))
								}
							</div>
						</div>
					</div>

					<div className={'relative z-20 col-span-1'} />

					<div className={'relative z-20 col-span-7 flex flex-col space-y-4'}>
						<label className={'flex flex-col space-y-1 '}>
							<p className={'text-base text-neutral-600'}>
								{'Reward Token'}
							</p>
							<div className={'flex h-10 items-center bg-neutral-0 p-2'}>
								<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
									<input
										className={`w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-bold outline-none scrollbar-none ${isActive ? '' : 'cursor-not-allowed'}`}
										type={'text'}
										placeholder={'0x...'}
										value={tokenAddress}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											if (isZeroAddress(e.target.value)) {
												set_tokenAddress(e.target.value);
											} else {
												set_tokenAddress(toAddress(e.target.value));
											}
										}} />
								</div>
							</div>
							<div className={'flex flex-row items-center justify-between'}>
								<p className={'text-sm text-neutral-400'}>
									{selectedToken ? `${selectedToken.name} (${selectedToken.symbol})` : ''} &nbsp;
								</p>
								<p className={'text-right text-sm text-neutral-400'}>
									{selectedToken ? `Balance: ${selectedToken.normalized}` : ''} &nbsp;
								</p>
							</div>
						</label>
			
						<label className={'flex flex-col space-y-1'}>
							<p className={'text-base text-neutral-600'}>{'Reward Amount'}</p>
							<div className={'flex h-10 items-center bg-neutral-0 p-2'}>
								<div className={'flex h-10 w-full flex-row items-center justify-between py-4 px-0'}>
									<input
										className={`w-full overflow-x-scroll border-none bg-transparent py-4 px-0 font-bold outline-none scrollbar-none ${isActive ? '' : 'cursor-not-allowed'}`}
										type={'text'}
										disabled={!isActive}
										value={amount.normalized}
										onChange={(e: ChangeEvent<HTMLInputElement>): void => {
											console.log(e);
										// set_amount(handleInputChange(e, allBalances?.[toAddress(selectedOptionFrom.value)]?.decimals || 18));
										}} />
									<button
										onClick={(): void => {
										// set_amount({
										// 	raw: allBalances?.[toAddress(selectedOptionFrom.value)]?.raw || ethers.constants.Zero,
										// 	normalized: allBalances?.[toAddress(selectedOptionFrom.value)]?.normalized || 0
										// });
										}}
										className={'cursor-pointer bg-neutral-900 px-2 py-1 text-xs text-neutral-0 transition-colors hover:bg-neutral-700'}>
										{'Max'}
									</button>
								</div>
							</div>
							<div className={'flex flex-row items-center justify-between'}>
								<p className={'pl-2 text-xs font-normal text-neutral-600'}>
									{getCounterValue(amount?.normalized || 0, 1)}
								</p>
							</div>
						</label>
				
						<div>{renderButton()}</div>
					</div>
				</div>
			</div>
			<GaugeList />
		</>
	);
}

export default NewVault;
