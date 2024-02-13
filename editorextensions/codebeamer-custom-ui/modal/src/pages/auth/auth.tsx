import { Field, Formik } from 'formik';
import * as React from 'react';
import './auth.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { setTrackerId } from '../../store/slices/userSettingsSlice';
import {
	setCbAddress,
	setProjectId,
} from '../../store/slices/boardSettingsSlice';
import { useState } from 'react';

interface Errors {
	cbAddress?: string;
}

/**
 * The authentication form lets a user define the codeBeamer instance they want to connect to
 * and provide their credentials. This only directly modifies the values kept in the store,
 * while actual connection attempts are made in the Content component.
 * @param props Loading defines whether or not to show a loading spinner on the button, errors show in notifications.
 */
export default function AuthForm(props: {
	loading?: boolean;
	headerLess?: boolean;
	successAnimation?: boolean;
}) {
	const dispatch = useDispatch();

	const [animateSuccess, setAnimateSuccess] = useState(false);
	const [showRCNHint, setShowRCNHint] = useState(false);

	const { cbAddress } = useSelector((state: RootState) => state.boardSettings);

	/**
	 * Toggles the {@link showRCNHint} variable, which triggers the respective hint to show or not.
	 */
	const toggleRCNHint = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.value.includes('retina')) {
			setShowRCNHint(true);
		} else {
			setShowRCNHint(false);
		}
	};

	const showSuccessAnimation = () => {
		setAnimateSuccess(true);
		setTimeout(() => {
			setAnimateSuccess(false);
		}, 2000);
	};

	return (
		<div data-test="auth" className="container">
			{!props.headerLess && (
				<header className="text-center mb-5">
					<h2>codebeamer cards</h2>
					<p className="m-1">
						<span className="icon icon-plug pos-adjusted-down"></span>
						<span className="ml-small">
							Connect to your codebeamer Instance
						</span>
					</p>
				</header>
			)}
			<div>
				<Formik
					initialValues={{
						cbAddress: cbAddress,
					}}
					enableReinitialize={true}
					validate={(values) => {
						const errors: Errors = {};

						if (!values.cbAddress) errors.cbAddress = 'Required';
						else if (values.cbAddress) {
							const regex = /^https?:\/\/[a-z0-9.-:]*\/cb$/;
							if (!values.cbAddress.match(regex))
								errors.cbAddress =
									'Not a valid CB Address! Must specify the protocol (HTTP(S)) and end with /cb';
						}

						if (Object.keys(errors).length) {
							return errors;
						}
					}}
					onSubmit={async (values, { setSubmitting }) => {
						setSubmitting(true);
						dispatch(setCbAddress(values.cbAddress));
						if (values.cbAddress != cbAddress) {
							dispatch(setProjectId(''));
							dispatch(setTrackerId(''));
						}

						if (props.successAnimation) showSuccessAnimation();
					}}
				>
					{({
						errors,
						touched,
						handleChange,
						handleSubmit,
						isSubmitting,
						/* and other goodies */
					}) => (
						<form onSubmit={handleSubmit}>
							<div
								className={`form-group ${
									touched.cbAddress
										? errors.cbAddress
											? 'error'
											: 'success'
										: ''
								}`}
							>
								<label>CodeBeamer Address</label>
								<Field
									type="text"
									name="cbAddress"
									className="input"
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>
									) => {
										handleChange(e);
										toggleRCNHint(e);
									}}
									data-test="cbAddress"
								/>
								{errors.cbAddress && touched.cbAddress && (
									<div
										className="status-text"
										data-test="cbAddressErrors"
									>
										{errors.cbAddress}
									</div>
								)}
								{showRCNHint && (
									<div
										className="status-text muted"
										data-test="rcnHint"
									>
										RCN connection required
									</div>
								)}
							</div>

							<div className="flex-centered mt-4 m-1">
								{!animateSuccess && (
									<button
										type="submit"
										disabled={isSubmitting || props.loading}
										className={`fade-in button button-primary ${
											isSubmitting || props.loading
												? 'button-loading'
												: ''
										}`}
										data-test="submit"
									>
										Connect
									</button>
								)}
								{animateSuccess && (
									<span>
										<svg
											className="checkmark"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 52 52"
										>
											<circle
												className="checkmark__circle"
												cx="26"
												cy="26"
												r="25"
												fill="none"
											/>
											<path
												className="checkmark__check"
												fill="none"
												d="M14.1 27.2l7.1 7.2 16.7-16.8"
											/>
										</svg>
									</span>
								)}
							</div>
						</form>
					)}
				</Formik>
			</div>
		</div>
	);
}
