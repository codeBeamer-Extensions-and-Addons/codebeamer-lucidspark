import * as React from 'react';
import {
	setCbAddress,
	setProjectId,
} from '../../store/slices/boardSettingsSlice';
import { setTrackerId } from '../../store/slices/userSettingsSlice';
import { getStore } from '../../store/store';
import Auth from './auth';

describe('<Auth>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Auth />);
	});

	describe('form elements', () => {
		beforeEach(() => {
			cy.mountWithStore(<Auth />);
		});

		it('has an input for the CodeBeamer Address', () => {
			cy.getBySel('cbAddress').type('address');
		});
		it('has a button to connect with', () => {
			cy.getBySel('submit');
		});
	});

	it('saves values in store when submitting the form', () => {
		const store = getStore();
		const cbAddress = 'https://codebeamer.com/cb';

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbAddress').type(cbAddress);

		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.be.calledWith(setCbAddress(cbAddress));
		});
	});

	it('resets the stored project- and trackerId when updating the cbAddress', () => {
		const store = getStore();
		const cbAddress = 'https://codebeamer.com/cb';

		const projectId = '';
		const trackerId = '';

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.spy(store, 'dispatch').as('dispatch');

		cy.getBySel('cbAddress').type(cbAddress);

		cy.getBySel('submit').click();

		cy.get('@dispatch').then((dispatch) => {
			expect(dispatch).to.have.been.calledWith(setCbAddress(cbAddress));
			expect(dispatch).to.have.been.calledWith(setProjectId(projectId));
			expect(dispatch).to.have.been.calledWith(setTrackerId(trackerId));
		});
	});

	describe('input validation', () => {
		//not going into all the details here, since it's just nice to have
		beforeEach(() => {
			cy.mountWithStore(<Auth />);
		});

		it('shows an error when entering an invalid codebeamer address', () => {
			cy.getBySel('cbAddress').type('tcp:/my.cb.io{enter}');

			cy.getBySel('cbAddressErrors').should('exist');
		});

		it('shows a hint about RCN connection when the cbAddress contains "retina"', () => {
			cy.getBySel('cbAddress').type('retina');

			cy.getBySel('rcnHint').should('exist');

			cy.getBySel('cbAddress').clear();
			cy.getBySel('rcnHint').should('not.exist');
		});

		it('shows (an) error(s) when submitting without having filled all inputs', () => {
			cy.getBySel('submit').click();

			cy.get('.status-text');
		});
	});

	it('loads cached values into the form', () => {
		const cbAddress = 'https://retina.roche.com/cb';

		const store = getStore();
		//"cache" is mocked by manually loading the values into store
		store.dispatch(setCbAddress(cbAddress));

		cy.mountWithStore(<Auth />, { reduxStore: store });

		cy.getBySel('cbAddress').should('have.value', cbAddress);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
