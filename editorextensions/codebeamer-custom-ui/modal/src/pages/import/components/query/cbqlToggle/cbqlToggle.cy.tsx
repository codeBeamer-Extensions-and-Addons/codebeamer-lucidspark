import * as React from 'react';
import CbqlToggle from './CbqlToggle';
import { getStore } from '../../../../../store/store';
import { setAdvancedSearch } from '../../../../../store/slices/userSettingsSlice';

const searchMethodSelector = 'search-method';
const cbqlIconSelector = 'cbql-icon';
const queryAssistant = 'icon-parameters';

describe('<CbqlToggle>', () => {
	it('mounts', () => {
		cy.mountWithStore(<CbqlToggle />);
	});

	it('displays the "CBQL" button by default', () => {
		cy.mountWithStore(<CbqlToggle />);

		cy.getBySel(cbqlIconSelector).should('exist');
	});

	describe('with cached setting', () => {
		it('displays "Query Assistant" when "Advanced Search" is enabled in cache', () => {
			const store = getStore();
			store.dispatch(setAdvancedSearch(true));

			cy.mountWithStore(<CbqlToggle />, { reduxStore: store });

			cy.getBySel(queryAssistant).should('exist');
		});

		it('displays "CBQL" when "Advanced Search" is disabled in cache', () => {
			const store = getStore();
			store.dispatch(setAdvancedSearch(false));

			cy.mountWithStore(<CbqlToggle />, { reduxStore: store });

			cy.getBySel(cbqlIconSelector).should('exist');
		});
	});

	it('updates the "Advanced Search" userSetting when the Query Assistant button is clicked', () => {
		const store = getStore();
		store.dispatch(setAdvancedSearch(false));

		cy.spy(store, 'dispatch').as('dispatch');

		cy.mountWithStore(<CbqlToggle />, { reduxStore: store });

		cy.getBySel(searchMethodSelector).click();

		cy.get('@dispatch').should(
			'have.been.calledWith',
			setAdvancedSearch(true)
		);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
