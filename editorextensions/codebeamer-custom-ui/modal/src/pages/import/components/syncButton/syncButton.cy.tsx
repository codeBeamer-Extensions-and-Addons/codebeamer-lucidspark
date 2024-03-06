import * as React from "react";
import SyncButton from "./syncButton";
import { CardBlockToCodebeamerItemMapping } from "../../../../models/lucidCardData";

describe("<SyncButton>", () => {
	it('displays the amount of already imported Items on the "Sync" button', () => {
		const items: CardBlockToCodebeamerItemMapping[] = [
			{ codebeamerItemId: 1, codebeamerTrackerId: 1, cardBlockId: "1" },
			{ codebeamerItemId: 2, codebeamerTrackerId: 1, cardBlockId: "2" },
			{ codebeamerItemId: 3, codebeamerTrackerId: 1, cardBlockId: "3" },
		];

		cy.mount(
			<SyncButton onSync={() => {}} importedItemsCount={items.length} />
		);

		cy.getBySel("sync").should("contain.text", items.length);
	});

	it('calls the passed handler when clicking the "Sync" button', () => {
		const handler = cy.spy().as("handler");

		const items: CardBlockToCodebeamerItemMapping[] = [
			{ codebeamerItemId: 1, codebeamerTrackerId: 1, cardBlockId: "1" },
			{ codebeamerItemId: 2, codebeamerTrackerId: 1, cardBlockId: "2" },
			{ codebeamerItemId: 3, codebeamerTrackerId: 1, cardBlockId: "3" },
		];

		cy.mount(
			<SyncButton onSync={handler} importedItemsCount={items.length} />
		);

		cy.getBySel("sync").click();

		cy.get("@handler").should("have.been.calledOnce");
	});
});
