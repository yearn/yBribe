import {cloneElement, useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {AnimatePresence} from 'framer-motion';
import {Popover, Transition} from '@headlessui/react';
import {Header} from '@yearn-finance/web-lib/components/Header';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {useMenu} from '@common/contexts/useMenu';
import {LogoYearn} from '@common/icons/LogoYearn';
import {YBribeHeader} from '@yBribe/components/header/YBribeHeader';

import {AppName, APPS} from './Apps';
import {MotionDiv} from './MotionDiv';

import type {ReactElement} from 'react';
import type {TMenu} from '@yearn-finance/web-lib/components/Header';

function Logo(): ReactElement {
	const {pathname} = useRouter();

	return (
		<>
			<YBribeHeader pathname={pathname} />
			<MotionDiv
				name={'yearn'}
				animate={pathname === '/' ? 'enter' : 'exit'}>
				<LogoYearn
					className={'h-8 w-8'}
					back={'text-neutral-900'}
					front={'text-neutral-0'}
				/>
			</MotionDiv>
		</>
	);
}

function LogoPopover(): ReactElement {
	const [isShowing, set_isShowing] = useState(false);

	return (
		<>
			<Popover
				onMouseEnter={(): void => set_isShowing(true)}
				onMouseLeave={(): void => set_isShowing(false)}>
				<div
					onClick={(): void => set_isShowing(false)}
					onMouseEnter={(): void => set_isShowing(false)}
					className={cl(
						'fixed inset-0 bg-black backdrop-blur-sm transition-opacity',
						!isShowing ? 'opacity-0 pointer-events-none' : 'opacity-50 pointer-events-auto'
					)}
				/>
				<Popover.Button className={'z-20 flex items-center'}>
					<Link href={'/'}>
						<span className={'sr-only'}>{'Back to home'}</span>
						<Logo />
					</Link>
				</Popover.Button>

				<Transition.Root show={isShowing}>
					<Transition.Child
						as={'div'}
						enter={'transition ease-out duration-200'}
						enterFrom={'opacity-0 translate-y-1'}
						enterTo={'opacity-100 translate-y-0'}
						leave={'transition ease-in duration-150'}
						leaveFrom={'opacity-100 translate-y-0'}
						leaveTo={'opacity-0 translate-y-1'}
						className={'relative z-[9999999]'}>
						<Popover.Panel
							className={'absolute left-1/2 z-20 w-80 -translate-x-1/2 px-4 pt-6 sm:px-0 md:w-[560px]'}>
							<div className={'overflow-hidden pt-4 shadow-xl'}>
								<div
									className={cl(
										'relative grid grid-cols-2 gap-2 border p-6 md:grid-cols-5',
										'bg-[#F4F4F4] dark:bg-[#282828] border-transparent'
									)}>
									<div className={'col-span-3 grid grid-cols-2 gap-2 md:grid-cols-3'}>
										{[...Object.values(APPS)]
											.filter(({isDisabled}): boolean => !isDisabled)
											.map(({name, href, icon}): ReactElement => {
												return (
													<Link
														prefetch={false}
														key={name}
														href={href}
														onClick={(): void => set_isShowing(false)}>
														<div
															onClick={(): void => set_isShowing(false)}
															className={cl(
																'flex cursor-pointer border flex-col items-center justify-center transition-colors p-4',
																'bg-[#EBEBEB] border-transparent hover:bg-[#c3c3c380] dark:bg-[#0C0C0C] hover:dark:bg-[#3d3d3d80]'
															)}>
															<div>{cloneElement(icon, {className: 'w-8 h-8'})}</div>
															<div className={'pt-2 text-center'}>
																<b className={'text-base'}>{name}</b>
															</div>
														</div>
													</Link>
												);
											})}
									</div>
								</div>
							</div>
						</Popover.Panel>
					</Transition.Child>
				</Transition.Root>
			</Popover>
		</>
	);
}

export function AppHeader(): ReactElement {
	const {pathname} = useRouter();
	const {onOpenMenu} = useMenu();
	const menu = useMemo((): TMenu[] => {
		const HOME_MENU = {path: '/', label: 'Home'};
		return [HOME_MENU, ...APPS[AppName.YBRIBE].menu];
	}, []);

	return (
		<Header
			showNetworkSelector={false}
			linkComponent={<Link href={''} />}
			currentPathName={pathname}
			onOpenMenuMobile={onOpenMenu}
			nav={menu}
			logo={
				<AnimatePresence mode={'wait'}>
					<LogoPopover />
				</AnimatePresence>
			}
		/>
	);
}
