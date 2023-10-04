import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import MiroImporter from './MiroImporter';
import { CompressedItem } from '../settings/miroImport/MiroImport';

describe('<MiroImporter>', () => {
	it('mounts', () => {
		cy.mountWithStore(<MiroImporter items={[]} />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<MiroImporter items={[]} />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<MiroImporter items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<MiroImporter items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('fetches the details of the items passed as props', () => {
		const items: CompressedItem[] = [
			{ id: '1', coordinates: { x: 0, y: 0 } },
			{ id: '2', coordinates: { x: 0, y: 0 } },
			{ id: '3', coordinates: { x: 0, y: 0 } },
		];

		const expectedQuery = `item.id IN (1,2,3)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<MiroImporter items={items} />, {});

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('fetches the tracker details of the items passed as props', () => {
		const items: CompressedItem[] = [
			{ id: '1', coordinates: { x: 0, y: 0 } },
			{ id: '2', coordinates: { x: 0, y: 0 } },
			{ id: '3', coordinates: { x: 0, y: 0 } },
		];
		const store = getStore();

		cy.intercept('POST', '**/wiki2html');

		cy.intercept('POST', '**/api/v3/items/query', {
			fixture: 'query_diff_trackers.json',
		}).as('fetch');

		cy.intercept('GET', '**/api/v3/trackers/101').as('trackerFetchOne');
		cy.intercept('GET', '**/api/v3/trackers/102').as('trackerFetchTwo');
		cy.intercept('GET', '**/api/v3/trackers/103').as('trackerFetchThree');
		cy.intercept('GET', '**/api/v3/trackers/104').as('trackerFetchFour');

		cy.mountWithStore(<MiroImporter items={items} />, {
			reduxStore: store,
		});

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
});
