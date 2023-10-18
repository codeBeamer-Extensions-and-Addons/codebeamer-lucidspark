import * as React from 'react';
import Footer from './Footer';

describe('<Footer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Footer />);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
