import React, { useState } from 'react';

import './footer.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import {
	setAdvancedSearch,
	setShowAnnouncements,
} from '../../../../store/slices/userSettingsSlice';
import Settings from '../settings/Settings';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function Footer() {
	const dispatch = useDispatch();

	const [showSettings, setShowSettings] = useState(false);

	const { advancedSearch } = useSelector(
		(state: RootState) => state.userSettings
	);

	const toggleSearchMethod = () => {
		dispatch(setAdvancedSearch(!advancedSearch));
	};

	const openSettingsModal = () => {
		setShowSettings(true);
	};

	return (
		<>
			<div className="actions flex flex- import footer">
				<DefaultOverlayTrigger
					content={advancedSearch ? 'Assisted Query' : 'CBQL Input'}
				>
					<button
						className={`mx-1 
							${
								advancedSearch
									? 'button-icon-small button-icon button-icon-secondary icon-parameters'
									: 'button button-secondary button-small'
							}`}
						onClick={toggleSearchMethod}
						data-test="search-method"
					>
						{advancedSearch ? (
							''
						) : (
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
						)}
					</button>
				</DefaultOverlayTrigger>
				<DefaultOverlayTrigger content="Settings">
					<button
						className="button button-secondary button-small mx-1"
						onClick={openSettingsModal}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="ionIcon pos-adjusted-up"
							viewBox="0 0 512 512"
						>
							<path
								d="M262.29 192.31a64 64 0 1057.4 57.4 64.13 64.13 0 00-57.4-57.4zM416.39 256a154.34 154.34 0 01-1.53 20.79l45.21 35.46a10.81 10.81 0 012.45 13.75l-42.77 74a10.81 10.81 0 01-13.14 4.59l-44.9-18.08a16.11 16.11 0 00-15.17 1.75A164.48 164.48 0 01325 400.8a15.94 15.94 0 00-8.82 12.14l-6.73 47.89a11.08 11.08 0 01-10.68 9.17h-85.54a11.11 11.11 0 01-10.69-8.87l-6.72-47.82a16.07 16.07 0 00-9-12.22 155.3 155.3 0 01-21.46-12.57 16 16 0 00-15.11-1.71l-44.89 18.07a10.81 10.81 0 01-13.14-4.58l-42.77-74a10.8 10.8 0 012.45-13.75l38.21-30a16.05 16.05 0 006-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 00-6.07-13.94l-38.19-30A10.81 10.81 0 0149.48 186l42.77-74a10.81 10.81 0 0113.14-4.59l44.9 18.08a16.11 16.11 0 0015.17-1.75A164.48 164.48 0 01187 111.2a15.94 15.94 0 008.82-12.14l6.73-47.89A11.08 11.08 0 01213.23 42h85.54a11.11 11.11 0 0110.69 8.87l6.72 47.82a16.07 16.07 0 009 12.22 155.3 155.3 0 0121.46 12.57 16 16 0 0015.11 1.71l44.89-18.07a10.81 10.81 0 0113.14 4.58l42.77 74a10.8 10.8 0 01-2.45 13.75l-38.21 30a16.05 16.05 0 00-6.05 14.08c.33 4.14.55 8.3.55 12.47z"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="32"
							/>
						</svg>
					</button>
				</DefaultOverlayTrigger>
				<DefaultOverlayTrigger content="Latest update informations">
					<button
						className="button-secondary button-small button mx-1"
						onClick={() => dispatch(setShowAnnouncements(true))}
					>
						<span className="icon icon-bell clickable"></span>
					</button>
				</DefaultOverlayTrigger>
			</div>
			{showSettings && (
				<Settings onClose={() => setShowSettings(false)} />
			)}
		</>
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
