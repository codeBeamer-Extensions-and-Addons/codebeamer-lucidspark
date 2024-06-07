import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import ActiveFilters from './activeFilters/ActiveFilters';
import CbqlInput from './cbqlInput/CbqlInput';
import FilterInput from './filterInput/FilterInput';
import TrackerSelect from './trackerSelect/TrackerSelect';
import CbqlToggle from './cbqlToggle/CbqlToggle';

import './query.css';

export default function Query() {
	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	return (
		<div className="flex-row align-items-center">
			{advancedSearch ? (
				<div className="w-100">
					<CbqlInput />
				</div>
			) : (
				<div className="grid fade-in-quick">
					<div className="cs1 ce3">
						<TrackerSelect />
					</div>
					<div className="cs4 ce7 text-center form-group">
						<FilterInput />
					</div>
					<div className="cs8 ce12 text-center active-filters-container">
						<ActiveFilters />
					</div>
				</div>
			)}
			<CbqlToggle />
		</div>
	);
}
