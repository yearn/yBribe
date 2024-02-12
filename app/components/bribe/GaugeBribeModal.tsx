import {useCallback, useMemo, useState} from 'react';
import {erc20ABI, useContractReads} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {
	decodeAsBigInt,
	decodeAsNumber,
	decodeAsString,
	formatCounterValue,
	handleInputChangeValue,
	isZero,
	isZeroAddress,
	toAddress,
	toBigInt,
	toNormalizedBN,
	toNormalizedValue,
	zeroNormalizedBN
} from '@builtbymom/web3/utils';
import {approveERC20, defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useYearn} from '@yearn-finance/web-lib/contexts/useYearn';
import {CURVE_BRIBE_V3_ADDRESS, ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {addReward} from '@yBribe/actions';
import {useBribes} from '@yBribe/contexts/useBribes';
import {YBRIBE_SUPPORTED_NETWORK} from '@yBribe/index';

import type {ChangeEvent, ReactElement} from 'react';
import type {TCurveGauge} from '@yearn-finance/web-lib/utils/schemas/curveSchemas';
import type {TNormalizedBN} from '@builtbymom/web3/types';
import type {TAddress} from '@builtbymom/web3/types/address';

type TExpectedOutFetcher = {
	name: string;
	symbol: string;
	decimals: number;
	normalized: number;
	raw: bigint;
	allowance: bigint;
};
const defaultExpectedOutFetcher: TExpectedOutFetcher = {
	name: '',
	symbol: '',
	decimals: 0,
	normalized: 0,
	raw: toBigInt(0),
	allowance: toBigInt(0)
};

export function GaugeBribeModal({
	currentGauge,
	onClose
}: {
	currentGauge: TCurveGauge;
	onClose: VoidFunction;
}): ReactElement {
	const {address, provider, isActive, openLoginModal} = useWeb3();
	const {refresh} = useBribes();
	const {prices} = useYearn();
	const [amount, set_amount] = useState<TNormalizedBN>(zeroNormalizedBN);
	const [tokenAddress, set_tokenAddress] = useState<TAddress | undefined>();
	const [txStatusApprove, set_txStatusApprove] = useState(defaultTxStatus);
	const [txStatusAddReward, set_txStatusAddReward] = useState(defaultTxStatus);
	const {data, isSuccess, refetch} = useContractReads({
		contracts: [
			{address: tokenAddress, abi: erc20ABI, functionName: 'name'},
			{address: tokenAddress, abi: erc20ABI, functionName: 'symbol'},
			{address: tokenAddress, abi: erc20ABI, functionName: 'decimals'},
			{
				address: tokenAddress,
				abi: erc20ABI,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			{
				address: tokenAddress,
				abi: erc20ABI,
				functionName: 'allowance',
				args: [toAddress(address), CURVE_BRIBE_V3_ADDRESS]
			}
		]
	});

	const selectedToken = useMemo((): TExpectedOutFetcher => {
		if (!data || !isSuccess) {
			return defaultExpectedOutFetcher;
		}
		return {
			name: decodeAsString(data[0]),
			symbol: decodeAsString(data[1]),
			decimals: decodeAsNumber(data[2]) || Number(decodeAsBigInt(data[2])),
			raw: decodeAsBigInt(data[3]),
			normalized: toNormalizedValue(decodeAsBigInt(data[3]), decodeAsNumber(data[2])),
			allowance: decodeAsBigInt(data[4])
		};
	}, [data, isSuccess]);

	const onApprove = useCallback(async (): Promise<void> => {
		const result = await approveERC20({
			connector: provider,
			chainID: YBRIBE_SUPPORTED_NETWORK,
			contractAddress: tokenAddress,
			spenderAddress: CURVE_BRIBE_V3_ADDRESS,
			amount: amount.raw,
			statusHandler: set_txStatusApprove
		});
		if (result.isSuccessful) {
			await refetch();
		}
	}, [amount.raw, refetch, provider, tokenAddress]);

	const onAddReward = useCallback(async (): Promise<void> => {
		const result = await addReward({
			connector: provider,
			chainID: YBRIBE_SUPPORTED_NETWORK,
			contractAddress: CURVE_BRIBE_V3_ADDRESS,
			gaugeAddress: currentGauge.gauge,
			tokenAddress: tokenAddress,
			amount: amount.raw,
			statusHandler: set_txStatusAddReward
		});
		if (result.isSuccessful) {
			onClose();
			await refetch();
			await refresh();
		}
	}, [amount.raw, currentGauge.gauge, refetch, onClose, provider, refresh, tokenAddress]);

	function renderButton(): ReactElement {
		if (!isActive) {
			return (
				<Button
					onClick={openLoginModal}
					className={'w-full'}>
					{'Connect wallet'}
				</Button>
			);
		}
		if (txStatusApprove.pending || toBigInt(amount.raw) > toBigInt(selectedToken?.allowance)) {
			return (
				<Button
					onClick={onApprove}
					className={'w-full'}
					isBusy={txStatusApprove.pending}
					isDisabled={!isActive || isZeroAddress(tokenAddress) || isZero(amount.raw)}>
					{`Approve ${selectedToken?.symbol || 'token'}`}
				</Button>
			);
		}

		return (
			<Button
				onClick={onAddReward}
				className={'w-full'}
				isBusy={txStatusAddReward.pending}
				isDisabled={
					!isActive ||
					isZeroAddress(tokenAddress) ||
					isZero(amount.raw) ||
					toBigInt(amount?.raw) > toBigInt(selectedToken?.raw)
				}>
				{'Deposit'}
			</Button>
		);
	}

	return (
		<div className={'mx-auto block w-full bg-neutral-0 p-4 md:p-10'}>
			<div className={'relative z-20 col-span-6 flex flex-col space-y-1'}>
				<div>
					<b className={'text-3xl text-neutral-900'}>{`Offer bribe to ${currentGauge.name}`}</b>
					<p className={'pt-4'}>
						{'Choose your reward token contract and reward amount to offer a bribe on your chosen gauge.'}
					</p>
				</div>
			</div>
			<div className={'mt-6 grid grid-cols-12 gap-4'}>
				<div className={'relative z-20 col-span-12 flex flex-col space-y-4'}>
					<div className={'flex flex-col space-y-1 '}>
						<p className={'text-base text-neutral-600'}>{'Reward Token'}</p>
						<div className={'flex h-10 items-center bg-neutral-100 p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									className={`w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-bold outline-none scrollbar-none ${
										isActive ? '' : 'cursor-not-allowed'
									}`}
									type={'text'}
									placeholder={'0x...'}
									value={tokenAddress}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										const {value} = e.target;
										if (
											value === '' ||
											value.match(/^(0[x]{0,1})[a-fA-F0-9]{0,40}/gm)?.includes(value)
										) {
											if (isZeroAddress(value)) {
												set_tokenAddress(ZERO_ADDRESS);
											} else {
												set_tokenAddress(toAddress(value));
											}
										}
									}}
								/>
							</div>
						</div>
					</div>

					<div className={'flex flex-col space-y-1'}>
						<p className={'text-base text-neutral-600'}>{'Reward Amount'}</p>
						<div className={'flex h-10 items-center bg-neutral-100 p-2'}>
							<div className={'flex h-10 w-full flex-row items-center justify-between px-0 py-4'}>
								<input
									className={`w-full overflow-x-scroll border-none bg-transparent px-0 py-4 font-bold outline-none scrollbar-none ${
										isActive ? '' : 'cursor-not-allowed'
									}`}
									type={'text'}
									disabled={!isActive}
									value={amount.normalized}
									onChange={(e: ChangeEvent<HTMLInputElement>): void => {
										set_amount(
											handleInputChangeValue(e.target.value, selectedToken?.decimals || 18)
										);
									}}
								/>
								<button
									onClick={(): void => {
										if (selectedToken) {
											set_amount(toNormalizedBN(selectedToken.raw, selectedToken.decimals));
										}
									}}
									className={
										'cursor-pointer bg-neutral-900 px-2 py-1 text-xs text-neutral-0 transition-colors hover:bg-neutral-700'
									}>
									{'Max'}
								</button>
							</div>
						</div>
					</div>

					<div className={'space-y-1 border-t border-neutral-200 bg-neutral-0 py-6'}>
						<div className={'flex flex-row items-center justify-between'}>
							<p className={'text-sm text-neutral-400'}>{'Token'}</p>
							<p className={'text-base tabular-nums text-neutral-900'}>
								{selectedToken ? `${selectedToken?.name} (${selectedToken?.symbol})` : '-'}
							</p>
						</div>
						<div className={'flex flex-row items-center justify-between'}>
							<p className={'text-sm text-neutral-400'}>{'Value'}</p>
							<p className={'font-number text-base text-neutral-900'}>
								{selectedToken
									? formatCounterValue(
											amount?.normalized || 0,
											Number(prices?.[toAddress(tokenAddress)] || 0) / 1000000
										)
									: '-'}
							</p>
						</div>
						<div className={'flex flex-row items-center justify-between'}>
							<p className={'text-sm text-neutral-400'}>{'Amount'}</p>
							<p className={'font-number text-sm text-neutral-900'}>
								{selectedToken ? `${amount.raw.toString()}` : '-'}
							</p>
						</div>
						<div className={'flex flex-row items-center justify-between'}>
							<p className={'text-sm text-neutral-400'}>{'Gauge'}</p>
							<p className={'font-number text-sm text-neutral-900'}>{currentGauge.gauge}</p>
						</div>
					</div>

					<div>{renderButton()}</div>
				</div>
			</div>
		</div>
	);
}
