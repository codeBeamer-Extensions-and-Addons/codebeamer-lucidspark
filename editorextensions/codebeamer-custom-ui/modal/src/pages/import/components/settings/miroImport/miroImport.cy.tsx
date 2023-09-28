import React from 'react';
import MiroImport from './MiroImport';

describe('<MiroImport', () => {
	it('mounts', () => {
		cy.mountWithStore(<MiroImport />);
	});

    it('has a button to import cb-miro items', () => {
        cy.mountWithStore(<MiroImport />);
        cy.get('button').contains('Import');
    });
});