import React, {ReactElement} from 'react';
import {useBribes} from 'contexts/useBribes';

function	GaugeTableEmpty({category}: {category: string}): ReactElement {
	const	{isLoading} = useBribes();

	if (isLoading) {
		return (
			<div className={'flex h-96 w-full flex-col items-center justify-center py-2 px-10'}>
				<b className={'text-lg'}>{'Fetching gauge data'}</b>
				<p className={'text-neutral-600'}>{'We are retrieving the gauge. Please wait.'}</p>
			</div>
		);	
	}
	if (category === 'claimable') {
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