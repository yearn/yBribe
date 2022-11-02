import React, {createContext, useContext, useMemo} from 'react';
import axios from 'axios';
import useSWR from 'swr';

import type {TCurveGauges} from 'types/curves.d';

export type	TCurveContext = {
	gauges: TCurveGauges[],
}
const	defaultProps: TCurveContext = {
	gauges: []
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const curveBaseFetcher = async (url: string): Promise<any> => axios.get(url).then((res): any => res.data?.data || {});

const	CurveContext = createContext<TCurveContext>(defaultProps);
export const CurveContextApp = ({children}: {children: React.ReactElement}): React.ReactElement => {
	/* 🔵 - Yearn Finance ******************************************************
	**	Fetch the gauges from Curve Finance and remove the unwanted ones, aka:
	**	- the ones that are not killed
	**	- the ones that are on a sidechain
	**	- the ones that are factory gauges
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
			if (currentGauge.factory) {
				continue;
			}
			_gaugesForMainnet.push(currentGauge);
		}
		return _gaugesForMainnet;
	}, [gaugesWrapper]);

	/* 🔵 - Yearn Finance ******************************************************
	**	Setup and render the Context provider to use in the app.
	***************************************************************************/
	return (
		<CurveContext.Provider
			value={{
				gauges: gauges || []
			}}>
			{children}
		</CurveContext.Provider>
	);
};


export const useCurve = (): TCurveContext => useContext(CurveContext);
export default useCurve;