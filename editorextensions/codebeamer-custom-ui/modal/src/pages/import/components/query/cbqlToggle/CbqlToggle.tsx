import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdvancedSearch } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';
import DefaultOverlayTrigger from '../../../../../components/defaultOverlayTrigger/DefautOverlayTrigger';

export default function CbqlToggle() {
	const dispatch = useDispatch();
	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	const toggleSearchMethod = () => {
		dispatch(setAdvancedSearch(!advancedSearch));
	};

	return (
		<div className="flex-row">
			<div className="ml-1" />
			<div className="mt-1 mr-1 soft-border-left" />
			<DefaultOverlayTrigger
				content={advancedSearch ? 'CBQL Input' : 'Assisted Query'}
			>
				<button
					className={'mx-1 mt-1 button button-secondary button-small'}
					onClick={toggleSearchMethod}
					data-test="search-method"
				>
					{advancedSearch ? (
						<i data-test="cbql-icon">
							<svg
								width="24"
								height="24"
								viewBox="0 0 28 28"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<text fill="#000000">
									<tspan x="4" y="13" textLength="20">
										CB
									</tspan>
									<tspan x="4" y="25">
										QL
									</tspan>
								</text>
							</svg>
						</i>
					) : (
						<span
							data-test="icon-parameters"
							className="icon icon-parameters clickable"
						></span>
					)}
				</button>
			</DefaultOverlayTrigger>
		</div>
	);
}
