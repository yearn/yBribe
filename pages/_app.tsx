import React, {memo} from 'react';
import localFont from 'next/font/local';
import {useRouter} from 'next/router';
import manifest from 'public/manifest.json';
import {AnimatePresence, motion} from 'framer-motion';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {motionVariants} from '@builtbymom/web3/utils';
import {cl} from '@builtbymom/web3/utils/cl';
import {localhost} from '@builtbymom/web3/utils/wagmi/networks';
import {Analytics} from '@vercel/analytics/react';
import {arbitrum, base, fantom, mainnet, optimism, polygon} from '@wagmi/chains';
import Meta from '@yearn-finance/web-lib/components/Meta';
import {YearnContextApp} from '@yearn-finance/web-lib/contexts/useYearn';
import AppHeader from '@yBribe/components/common/Header';
import {HeroTimer} from '@yBribe/components/common/HeroTimer';
import {BribesContextApp} from '@yBribe/contexts/useBribes';
import {CurveContextApp} from '@yBribe/contexts/useCurve';
import {getNextThursday} from '@yBribe/index';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const aeonik = localFont({
	variable: '--font-aeonik',
	display: 'swap',
	src: [
		{
			path: '../public/fonts/Aeonik-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Bold.woff2',
			weight: '700',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Black.ttf',
			weight: '900',
			style: 'normal'
		}
	]
});

function AppWrapper(props: AppProps): ReactElement {
	const router = useRouter();
	const {Component, pageProps} = props;

	return (
		<>
			<Meta meta={manifest} />
			<div
				id={'app'}
				className={cl('mx-auto mb-0 flex font-aeonik')}>
				<div className={'block h-full min-h-max w-full'}>
					<AppHeader />
					<div className={'mx-auto my-0 max-w-6xl pt-4 md:mb-0 md:mt-16 md:!px-0'}>
						<AnimatePresence mode={'wait'}>
							<motion.div
								key={router.asPath}
								initial={'initial'}
								animate={'enter'}
								exit={'exit'}
								className={'my-0 h-full md:mb-0 md:mt-16'}
								variants={motionVariants}>
								<HeroTimer endTime={getNextThursday()} />
								<Component
									router={props.router}
									{...pageProps}
								/>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			</div>
			<Analytics />
		</>
	);
}

/**** 🔵 - Yearn Finance ***************************************************************************
 ** The 'App' function is a React functional component that returns a ReactElement. It uses several
 ** hooks and components to build the main structure of the application.
 **
 ** The 'useCurrentApp' hook is used to get the current app manifest.
 **
 ** The 'MenuContextApp', 'YearnContextApp', and 'WalletContextApp' are context providers that
 ** provide global state for the menu, Yearn, and wallet respectively.
 ** The 'Meta' component is used to set the meta tags for the page.
 ** The 'WithLayout' component is a higher-order component that wraps the current page component
 ** and provides layout for the page.
 **
 ** The 'NetworkStatusIndicator' component is used to display the network status.
 ** The returned JSX structure is wrapped with the context providers and includes the meta tags,
 ** layout, and network status indicator.
 **************************************************************************************************/
const App = memo(function App(props: AppProps): ReactElement {
	const {Component, pageProps} = props;

	return (
		<YearnContextApp>
			<CurveContextApp>
				<BribesContextApp>
					<AppWrapper
						Component={Component}
						pageProps={pageProps}
						router={props.router}
					/>
				</BribesContextApp>
			</CurveContextApp>
		</YearnContextApp>
	);
});

/**** 🔵 - Yearn Finance ***************************************************************************
 ** The 'MyApp' function is a React functional component that returns a ReactElement. It is the main
 ** entry point of the application.
 **
 ** It uses the 'WithYearn' context provider to provide global state for Yearn. The 'WithYearn'
 ** component is configured with a list of supported chains and some options.
 **
 ** The 'App' component is wrapped with the 'WithYearn' component to provide it with the Yearn
 ** context.
 **
 ** The returned JSX structure is a main element with the 'WithYearn' and 'App' components.
 **************************************************************************************************/
function MyApp(props: AppProps): ReactElement {
	return (
		<main className={cl('flex flex-col h-screen', aeonik.className)}>
			<WithMom
				supportedChains={[mainnet, optimism, polygon, fantom, base, arbitrum, localhost]}
				tokenLists={[
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/yearn.json',
					'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/curve.json'
				]}>
				<WalletContextApp>
					<App {...props} />
				</WalletContextApp>
			</WithMom>
		</main>
	);
}

export default MyApp;
