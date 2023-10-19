import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdvancedSearch } from '../../../../../store/slices/userSettingsSlice';
import { RootState } from '../../../../../store/store';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function CbqlToggle() {
	const dispatch = useDispatch();
	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	const toggleSearchMethod = () => {
		dispatch(setAdvancedSearch(!advancedSearch));
	};

	return (
		<DefaultOverlayTrigger
			content={advancedSearch ? 'CBQL Input' : 'Assisted Query'}
		>
			<button
				className={`mx-1 
							${
								advancedSearch
									? 'button button-secondary button-small'
									: 'button-icon-small button-icon button-icon-secondary icon-parameters'
							}`}
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
					''
				)}
			</button>
		</DefaultOverlayTrigger>
	);
}

function DefaultOverlayTrigger(props: {
	children: JSX.Element;
	content: string;
}): JSX.Element {
	return (
		<OverlayTrigger
			placement="bottom"
			trigger={['hover', 'focus']}
			delay={{ show: 250, hide: 250 }}
			overlay={
				<Tooltip className="tooltip-grey">{props.content}</Tooltip>
			}
		>
			{props.children}
		</OverlayTrigger>
	);
}
