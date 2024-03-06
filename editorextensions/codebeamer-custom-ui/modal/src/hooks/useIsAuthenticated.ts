import { useSelector } from 'react-redux';
import { useTestAuthenticationQuery } from '../api/codeBeamerApi';
import { RootState } from '../store/store';
import { jwtDecode } from 'jwt-decode';

/**
 * Custom hook to check whether with the currently stored data, the user is authenticated.
 *
 * Updates each time the root address, name or password change.
 *
 * @returns An erray with two entries: isAuthenticated and isLoading
 */
export const useIsAuthenticated = () => {
	const { cbAddress, loading } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const { oAuthToken } = useSelector((state: RootState) => state.userSettings);

	let email = '';
	try {
		const decodedToken = jwtDecode(oAuthToken) as { email: string };
		email = decodedToken.email;
	} catch (e) {
		console.error('Failed to decode token:', e);
	}

	const { data, error, isLoading } = useTestAuthenticationQuery({
		cbAddress,
		email,
	});

	if (error || !data || !data.id) return [false, loading || isLoading];
	else return [true, loading || isLoading];
};
