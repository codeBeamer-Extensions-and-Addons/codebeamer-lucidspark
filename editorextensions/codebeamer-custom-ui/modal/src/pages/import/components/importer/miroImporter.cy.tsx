import * as React from 'react';
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

	it('sends the items to the editor extension  passed as props', () => {
		cy.stub(window.parent, 'postMessage').as('postMessageStub');
		const items: CompressedItem[] = [
			{ id: '1', coordinates: { x: 0, y: 0 } },
			{ id: '2', coordinates: { x: 0, y: 0 } },
			{ id: '3', coordinates: { x: 0, y: 0 } },
		];

		const expectedQuery = `item.id IN (1,2,3)`;

		cy.mountWithStore(<MiroImporter items={items} />, {});

		cy.get('@postMessageStub').should(
			'have.been.calledWith',
			{
				action: 'import',
				payload: { queryString: expectedQuery },
			},
			'*'
		);
	});
});
