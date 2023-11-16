import * as React from "react";
import ImportActions from "./ImportActions";

describe("<ImportActions>", () => {
	it("mounts", () => {
		cy.mount(
			<ImportActions
				selectedCount={0}
				unImportedItemsCount={0}
				onImportSelected={() => {}}
				onImportAll={() => {}}
			/>
		);
	});

	context("props", () => {
		it('displays the passed amount of selectedItems in the "Import Selection" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={5}
					unImportedItemsCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
				/>
			);

			cy.getBySel("importSelected").should(
				"have.text",
				"Import selection (5)"
			);
		});

		it('disabled the "Import Selection" button when no items have been selected', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					unImportedItemsCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
				/>
			);

			cy.getBySel("importSelected").should("be.disabled");
		});

		it('displays the passed amount of items that have not been imported yet in the "Import All" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					unImportedItemsCount={15}
					onImportSelected={() => {}}
					onImportAll={() => {}}
				/>
			);

			cy.getBySel("importAll").should("have.text", "Import all (15)");
		});

		it('calls the passed handler when clicking the "Import Selection" button', () => {
			const handler = cy.spy().as("handler");

			cy.mount(
				<ImportActions
					selectedCount={5}
					unImportedItemsCount={0}
					onImportSelected={handler}
					onImportAll={() => {}}
				/>
			);

			cy.getBySel("importSelected").click();

			cy.get("@handler").should("have.been.calledOnce");
		});

		it('calls the passed handler when clicking the "Import All" button', () => {
			const handler = cy.spy().as("handler");

			cy.mount(
				<ImportActions
					selectedCount={0}
					unImportedItemsCount={5}
					onImportSelected={() => {}}
					onImportAll={handler}
				/>
			);

			cy.getBySel("importAll").click();

			cy.get("@handler").should("have.been.calledOnce");
		});
	});
});
