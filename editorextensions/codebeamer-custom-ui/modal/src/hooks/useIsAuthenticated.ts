import { useSelector } from 'react-redux';
import { useTestAuthenticationQuery } from '../api/codeBeamerApi';
import { RootState } from '../store/store';

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

	const { data, error, isLoading } = useTestAuthenticationQuery({
		cbAddress,
	});
	console.log(data);

	if (error || !data || !data[0].id) return [false, loading || isLoading];
	else return [true, loading || isLoading];
};
