import React, {ReactElement} from 'react';

function	GaugeTableHead(): ReactElement {
	return (
		<div className={'mb-2 hidden w-full grid-cols-7 px-10 md:grid'}>
			<p className={'col-span-2 text-start text-base text-neutral-400'}>{'Token'}</p>
			<div className={'col-span-5 grid grid-cols-10 gap-10'}>

				<div
					className={'group col-span-2 flex flex-row items-center justify-end space-x-1'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Weight'}
					</p>
				</div>

				<div
					className={'group col-span-3 flex flex-row items-center justify-end space-x-1 pr-0'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Current $/10k veCRV'}
					</p>
				</div>

				<div
					className={'group col-span-3 flex flex-row items-center justify-end space-x-1 pr-0'}>
					<p className={'text-end text-base text-neutral-400'}>
						{'Pending $/10k veCRV'}
					</p>
				</div>

				<p className={'col-span-2 text-end text-base text-neutral-400'}>&nbsp;</p>
			</div>
		</div>
	);
}

export {GaugeTableHead};