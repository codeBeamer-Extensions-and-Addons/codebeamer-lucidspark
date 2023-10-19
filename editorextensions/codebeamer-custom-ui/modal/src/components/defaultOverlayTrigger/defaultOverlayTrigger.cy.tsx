import React from 'react';
import DefaultOverlayTrigger from './DefautOverlayTrigger';

describe('<DefaultOverlayTrigger>', () => {
	const testContent = 'Tooltip Content';

	it('mounts', () => {
		cy.mount(
			<DefaultOverlayTrigger content={testContent}>
				<button>Hover Me</button>
			</DefaultOverlayTrigger>
		);
	});

	it('displays the tooltip on hover', () => {
		cy.mount(
			<DefaultOverlayTrigger content={testContent}>
				<button>Hover Me</button>
			</DefaultOverlayTrigger>
		);

		cy.contains('Hover Me').trigger('mouseover');

		cy.get('.tooltip-grey').should('be.visible');
	});

	it('displays the passed content', () => {
		cy.mount(
			<DefaultOverlayTrigger content={testContent}>
				<button>Hover Me</button>
			</DefaultOverlayTrigger>
		);

		cy.contains('Hover Me').trigger('mouseover');

		cy.get('.tooltip-grey').should('contain.text', testContent);
	});

	it('has a default placement of "bottom"', () => {
		cy.mount(
			<DefaultOverlayTrigger content={testContent}>
				<button>Hover Me</button>
			</DefaultOverlayTrigger>
		);

		cy.contains('Hover Me').trigger('mouseover');

		cy.get('.tooltip-grey').should('have.attr', 'x-placement', 'bottom');
	});
});
