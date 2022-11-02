import React, {ReactElement} from 'react';
import {useWeb3} from '@yearn-finance/web-lib/contexts';
import {useBribes} from 'contexts/useBribes';

function	GaugeTableEmpty({category}: {category: string}): ReactElement {
	const	{isLoading} = useBribes();
	const	{isActive} = useWeb3();

	if (isLoading) {
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'Fetching gauge data'}</b>
				<p className={'text-neutral-600'}>{'We are retrieving the gauge. Please wait.'}</p>
			</div>
		);	
	}
	if (category === 'claimable') {
		if (!isActive) {
			return (
				<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
					<b className={'text-lg'}>{'Connect your wallet'}</b>
					<p className={'text-neutral-600'}>{'Please connect your wallet to load the gauges.'}</p>
				</div>
			);	
		}
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'No reward'}</b>
				<p className={'text-neutral-600'}>{'You have nothing to claim.'}</p>
			</div>
		);	
	}
	return (
		<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
			<b className={'text-lg'}>{'No Gauges'}</b>
			<p className={'text-neutral-600'}>
				{'No Gauges available.'}
			</p>
		</div>
	);	
}

export {GaugeTableEmpty};