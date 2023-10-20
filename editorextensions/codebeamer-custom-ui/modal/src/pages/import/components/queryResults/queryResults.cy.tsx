import * as React from 'react';
import { IFilterCriteria } from '../../../../models/filterCriteria.if';
import {
	addFilter,
	setTrackerId,
} from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import QueryResults from './QueryResults';
import query_multi_page from '../../../../../cypress/fixtures/query_multi-page.json';
import query_multi_page_2 from '../../../../../cypress/fixtures/query_multi-page_2.json';

describe('<QueryResults>', () => {
	it('mounts', () => {
		cy.mountWithStore(<QueryResults />);
	});

	it('queries the already imported items and displays them as checked and disabled when they appear in a query its results', () => {
		const itemOne: {
			cardBlock: { id: string };
			codebeamerItemId: number;
		} = { cardBlock: { id: '1' }, codebeamerItemId: 1 };
		const itemTwo: {
			cardBlock: { id: string };
			codebeamerItemId: number;
		} = { cardBlock: { id: '2' }, codebeamerItemId: 2 };
		const notSyncedItemOne: { codebeamerItemId: number } = {
			codebeamerItemId: 3,
		};
		const notSyncedItemTwo: { codebeamerItemId: number } = {
			codebeamerItemId: 4,
		};

		cy.stub(window.parent, 'postMessage').callsFake(() => {
			const data = [itemOne, itemTwo];
			window.postMessage(JSON.stringify(data), '*');
		});

		const store = getStore();
		const trackerId = '123';
		store.dispatch(setTrackerId(trackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		cy.getBySel('itemCheck-' + itemOne.codebeamerItemId)
			.should('be.checked')
			.and('be.disabled');
		cy.getBySel('itemCheck-' + itemTwo.codebeamerItemId)
			.should('be.checked')
			.and('be.disabled');
		cy.getBySel('itemCheck-' + notSyncedItemOne.codebeamerItemId)
			.should('not.be.checked')
			.and('be.enabled');
		cy.getBySel('itemCheck-' + notSyncedItemTwo.codebeamerItemId)
			.should('not.be.checked')
			.and('be.enabled');
	});

	it('queries items with the cached cbqlString when mounted', () => {
		const store = getStore();
		const trackerId = '123';
		const queryString = `tracker.id IN (${trackerId})`;
		//the cbqlString value in the store is set indirectly whenever value that it depends on change
		store.dispatch(setTrackerId(trackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', queryString);
	});

	it('fetches items whenever the selected tracker changes', () => {
		const store = getStore();
		const initialTrackerId = '1';

		const intermediateTrackerId = '5';
		const intermediateQueryString = `tracker.id IN (${intermediateTrackerId})`;

		const finalTrackerId = '2';
		const finalQueryString = `tracker.id IN (${finalTrackerId})`;

		store.dispatch(setTrackerId(initialTrackerId));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		store.dispatch(setTrackerId(intermediateTrackerId));
		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', intermediateQueryString)
			.then(() => {
				store.dispatch(setTrackerId(finalTrackerId));
				cy.wait('@itemQuery')
					.its('request.body.queryString')
					.should('equal', finalQueryString);
			});
	});

	it('fetches items when the filter changes', () => {
		const store = getStore();
		const trackerId = '123';
		const filter: IFilterCriteria = {
			id: 1,
			slug: 'Place',
			fieldName: 'place',
			value: 'Avignon',
		};
		const expectedQueryString = `tracker.id IN (${trackerId}) AND ('123.${filter.fieldName}' = '${filter.value}')`;

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query.json',
		}).as('itemQuery');

		store.dispatch(setTrackerId(trackerId));

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		store.dispatch(addFilter(filter));

		cy.wait('@itemQuery')
			.its('request.body.queryString')
			.should('equal', expectedQueryString);
	});

	it('passes the count of tracker items that have not been imported yet to the Import All button', () => {
		const mockImportedItems = [
			{
				cardBlock: { id: '1' },
				codebeamerItemId: 1,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '2' },
				codebeamerItemId: 2,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '3' },
				codebeamerItemId: 3,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '4' },
				codebeamerItemId: 4,
				codebeamerTrackerId: 4877085,
			},

			// items from a different tracker
			{
				cardBlock: { id: '5' },
				codebeamerItemId: 5,
				codebeamerTrackerId: 999,
			},
			{
				cardBlock: { id: '6' },
				codebeamerItemId: 6,
				codebeamerTrackerId: 999,
			},
			{
				cardBlock: { id: '7' },
				codebeamerItemId: 7,
				codebeamerTrackerId: 999,
			},
			{
				cardBlock: { id: '8' },
				codebeamerItemId: 8,
				codebeamerTrackerId: 999,
			},

			// duplicate items
			{
				cardBlock: { id: '9' },
				codebeamerItemId: 1,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '10' },
				codebeamerItemId: 2,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '11' },
				codebeamerItemId: 3,
				codebeamerTrackerId: 4877085,
			},
			{
				cardBlock: { id: '12' },
				codebeamerItemId: 4,
				codebeamerTrackerId: 4877085,
			},
		];

		cy.stub(window.parent, 'postMessage')
			.as('boardGetStub')
			.callsFake(() => {
				window.postMessage(JSON.stringify(mockImportedItems), '*');
			});

		const store = getStore();
		store.dispatch(setTrackerId('4877085'));

		cy.intercept('POST', `**/api/v3/items/query`, {
			fixture: 'query_multi-page.json',
		}).as('itemQuery');

		cy.mountWithStore(<QueryResults />, { reduxStore: store });

		const expectedCount = query_multi_page.items
			.concat(query_multi_page_2.items)
			.filter(
				(item) =>
					mockImportedItems.filter(
						(importedItem) =>
							importedItem.codebeamerItemId === item.id &&
							importedItem.codebeamerTrackerId === item.tracker.id
					).length === 0
			).length;

		cy.getBySel('importAll').should(
			'have.text',
			`Import all (${expectedCount})`
		);
	});

	describe('lazy loading', () => {
		beforeEach(() => {
			const store = getStore();
			const trackerId = '123';
			//the cbqlString value in the store is set indirectly whenever value that it depends on change
			store.dispatch(setTrackerId(trackerId));

			cy.intercept('POST', `**/api/v3/items/query`, {
				fixture: 'query_multi-page.json',
			}).as('initialQuery');

			cy.mountWithStore(<QueryResults />, { reduxStore: store });

			cy.wait('@initialQuery');
		});

		it('fetches the next result page of the current query when scrolling near the table its bottom', () => {
			cy.on('uncaught:exception', (err) => {
				//* not providing a new fixture for each page, so we'll get duplicates.
				if (err.message.includes('two children with the same key')) {
					return false;
				}
			});

			const expectedPage = 2;

			cy.intercept('POST', `**/api/v3/items/query`).as('itemQuery');

			cy.getBySel('resultsTable').scrollTo('bottom');

			cy.wait('@itemQuery')
				.its('request.body.page')
				.should('equal', expectedPage);
		});

		it('shows eos info when all items for a query have been loaded', () => {
			cy.intercept('POST', `**/api/v3/items/query`, {
				fixture: 'query_multi-page_2.json',
			}).as('itemQuery');

			cy.getBySel('resultsTable').scrollTo('bottom');
			cy.wait(1000);
			cy.getBySel('resultsTable').scrollTo('bottom');

			cy.getBySel('eosInfo').should('exist');
		});
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
