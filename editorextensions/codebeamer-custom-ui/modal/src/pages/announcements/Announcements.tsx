import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setShowAnnouncements } from '../../store/slices/userSettingsSlice';
import AnnouncementArticle from './announcement-article/AnnouncementArticle';

import './announcements.css';

/**
 * Container for (a) page(s) containing announcements.
 */
export default function Announcements() {
	const dispatch = useDispatch();

	const [dismissing, setDismissing] = useState(false);

	const dismiss = () => {
		setDismissing(true);
		setTimeout(() => {
			dispatch(setShowAnnouncements(false));
		}, 200);
	};

	return (
		<div
			className={`container centered-horizontally announcements ${
				dismissing ? 'shrink' : 'grow'
			}`}
			data-test="announcements"
		>
			<span className="close-button mb-3 clickable">
				<div
					onClick={() => dismiss()}
					className="icon icon-close clickable"
					data-test="close-announcements"
				></div>
			</span>
			<AnnouncementArticle date={'2023-10-03'} version={'1.0'}>
				<p className="mt-5">
					Welcome to codebeamer-cards for Lucidspark!
					<br />
					We&apos;re glad to have you here. This is the first version
					of the app, and features only minimal functionality.
					We&apos;re working hard to add more features, so stay tuned!
				</p>
			</AnnouncementArticle>

			<div className="announcement-actions mt-5 text-center">
				<h6 className="h6">Additional resources</h6>
				<a
					href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/blob/main/CHANGELOG.md"
					target="_blank"
					className="roche-primary-light"
					rel="noreferrer"
				>
					Detailed Changelog
				</a>{' '}
				|{' '}
				<a
					href="https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-lucidspark/wiki"
					target="_blank"
					className="roche-primary-light"
					rel="noreferrer"
				>
					Github Wiki
				</a>{' '}
				|{' '}
				<a
					href="https://retina.roche.com/cb/wiki/10407748"
					target="_blank"
					className="roche-primary-light"
					rel="noreferrer"
				>
					Retina Wiki
				</a>
			</div>
			<div className="skip-button mt-3">
				<a
					className="roche-primary-light text-decoration-none clickable"
					onClick={() => dismiss()}
					data-test="skip-announcements"
				>
					To the app -&gt;
				</a>
			</div>
		</div>
	);
}
