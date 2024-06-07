import * as React from "react";
import RelationsButton from "./relationsButton";
import { BlockRelation } from "../../../../models/lucidLineData";
import { RelationshipType } from "../../../../enums/associationRelationshipType.enum";

describe("<RelationsButton>", () => {
	it('displays the amount of missing relations on the "Relation & Association Visualization" button', () => {
		const relations: BlockRelation[] = [
			{
				sourceBlockId: "1",
				targetBlockId: "3",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "2",
				targetBlockId: "4",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "3",
				targetBlockId: "5",
				type: RelationshipType.DOWNSTREAM,
			},
		];

		cy.mount(
			<RelationsButton
				relationsCount={relations.length}
				missingRelationsCount={relations.length}
				areAllRelationsLoaded={true}
				isRelationsLoading={false}
				onRelations={() => {}}
			/>
		);

		cy.getBySel("relations").should("contain.text", relations.length);
	});

	it('disabled the "Relation & Association Visualization" button if no relations exist', () => {
		const relations: BlockRelation[] = [];

		cy.mount(
			<RelationsButton
				relationsCount={relations.length}
				missingRelationsCount={relations.length}
				areAllRelationsLoaded={true}
				isRelationsLoading={false}
				onRelations={() => {}}
			/>
		);

		cy.getBySel("relations").should("be.disabled");
	});

	it('displays "Show" on the "Relation & Association Visualization" buttons tooltip if missing relations exists', () => {
		const relations: BlockRelation[] = [
			{
				sourceBlockId: "1",
				targetBlockId: "3",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "2",
				targetBlockId: "4",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "3",
				targetBlockId: "5",
				type: RelationshipType.DOWNSTREAM,
			},
		];

		cy.mount(
			<RelationsButton
				relationsCount={relations.length}
				missingRelationsCount={relations.length}
				areAllRelationsLoaded={true}
				isRelationsLoading={false}
				onRelations={() => {}}
			/>
		);

		cy.getBySel("relations").trigger("mouseover");

		cy.get(".tooltip").should("exist");
		cy.get(".tooltip-inner").should("contain.text", "Show");
	});

	it('displays "Hide" on the "Relation & Association Visualization" buttons tooltip if there are no missing relations', () => {
		const relations: BlockRelation[] = [
			{
				sourceBlockId: "1",
				targetBlockId: "3",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "2",
				targetBlockId: "4",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "3",
				targetBlockId: "5",
				type: RelationshipType.DOWNSTREAM,
			},
		];

		cy.mount(
			<RelationsButton
				relationsCount={relations.length}
				missingRelationsCount={0}
				areAllRelationsLoaded={true}
				isRelationsLoading={false}
				onRelations={() => {}}
			/>
		);

		cy.getBySel("relations").trigger("mouseover");

		cy.get(".tooltip").should("exist");
		cy.get(".tooltip-inner").should("contain.text", "Hide");
	});

	it('calls the passed handler when clicking the "Relation & Association Visualization" button', () => {
		const handler = cy.spy().as("handler");

		const relations: BlockRelation[] = [
			{
				sourceBlockId: "1",
				targetBlockId: "3",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "2",
				targetBlockId: "4",
				type: RelationshipType.DOWNSTREAM,
			},
			{
				sourceBlockId: "3",
				targetBlockId: "5",
				type: RelationshipType.DOWNSTREAM,
			},
		];

		cy.mount(
			<RelationsButton
				relationsCount={relations.length}
				missingRelationsCount={relations.length}
				areAllRelationsLoaded={true}
				isRelationsLoading={false}
				onRelations={handler}
			/>
		);

		cy.getBySel("relations").click();

		cy.get("@handler").should("have.been.calledOnce");
	});
});
