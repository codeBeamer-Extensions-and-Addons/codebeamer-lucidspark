import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Importer from './Importer';

describe('<Importer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Importer items={[]} />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<Importer items={[]} />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('fetches the details of the items passed as props', () => {
		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (1,2,3)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('fetches the tracker details of the items passed as props', () => {
		const items: string[] = ['1', '2', '3', '4'];
		const store = getStore();

		cy.intercept('POST', '**/wiki2html');

		cy.intercept('POST', '**/api/v3/items/query', {
			fixture: 'query_diff_trackers.json',
		}).as('fetch');

		cy.intercept('GET', '**/api/v3/trackers/101').as('trackerFetchOne');
		cy.intercept('GET', '**/api/v3/trackers/102').as('trackerFetchTwo');
		cy.intercept('GET', '**/api/v3/trackers/103').as('trackerFetchThree');
		cy.intercept('GET', '**/api/v3/trackers/104').as('trackerFetchFour');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch');

		cy.wait('@trackerFetchOne').then((interception) => {
			expect(interception.request.url).to.contain('trackers/101');
		});

		cy.wait('@trackerFetchTwo').then((interception) => {
			expect(interception.request.url).to.contain('trackers/102');
		});

		cy.wait('@trackerFetchThree').then((interception) => {
			expect(interception.request.url).to.contain('trackers/103');
		});

		cy.wait('@trackerFetchFour').then((interception) => {
			expect(interception.request.url).to.contain('trackers/104');
		});
	});

	it('fetches the details of all items in the selected tracker (without any additional filter criteria) when passing an empty array as prop', () => {
		const items: string[] = [];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('appends what items are already imported to the queryString so as not to duplicate them', () => {
		cy.stub(window.parent, 'postMessage')
			.as('boardGetStub')
			.callsFake(() => {
				window.postMessage(JSON.stringify(mockImportedItems), '*');
			});

		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (${items.join(
			','
		)}) AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

		cy.intercept('POST', '**/api/v3/items/query', {
			statusCode: 200,
			body: [],
		}).as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.get('@boardGetStub').should('be.called');

		//that's just React, or my inability to properly use it - one call will be made to @fetch before the importedItems
		//are updated. once they are, an overriding second call is made, which is the final one we want
		cy.wait('@fetch');

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	context('prop queryString', () => {
		it('fetches the details of the items specified in the queryString if one is specified', () => {
			const mockQueryString = 'item.id IN (1,2,3,4)';
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(
				<Importer items={[]} queryString={mockQueryString} />
			);

			cy.wait('@fetch')
				.its('request.body.queryString')
				.should('equal', mockQueryString);
		});

		it('still appends what items are already imported to the queryString so as not to duplicate them', () => {
			cy.stub(window.parent, 'postMessage')
				.as('boardGetStub')
				.callsFake(() => {
					window.postMessage(JSON.stringify(mockImportedItems), '*');
				});

			const mockQueryString = 'item.id IN (1,2,3,4)';

			const expectedQuery = `${mockQueryString} AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

			cy.intercept('POST', '**/api/v3/items/query', {
				statusCode: 200,
				body: [],
			}).as('fetch');

			cy.mountWithStore(
				<Importer items={[]} queryString={mockQueryString} />
			);

			cy.get('@boardGetStub').should('be.called');

			//that's just React, or my inability to properly use it - one call will be made to @fetch before the importedItems
			//are updated. once they are, an overriding second call is made, which is the final one we want
			cy.wait('@fetch');

			cy.wait('@fetch')
				.its('request.body.queryString')
				.should('equal', expectedQuery);
		});
	});
});

const mockImportedItems = [
	{ cardBlock: { id: '1' }, codebeamerItemId: 569657 },
	{ cardBlock: { id: '2' }, codebeamerItemId: 569527 },
];
