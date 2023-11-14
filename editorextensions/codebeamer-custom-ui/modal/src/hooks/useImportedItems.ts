import React, { useState } from "react";
import { CardBlockToItemMapping } from "../models/cardBlockToItemMapping.if";
import { store } from "../store/store";
import { RelationsQuery, AssociationDetails } from "../models/api-query-types";
import { RelationshipType } from "../enums/associationRelationshipType.enum";
import { CardBlockToCodeBeamerItemMapping } from "../models/lucidCardData";
import { MessageHandler } from "../api/MessageHandler";
import { BlockRelation } from "../models/lucidLineData";

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToItemMapping}s matching the CardBlocks on the board.
 */
export const useImportedItems = (trackerId?: string) => {
	const [importedItems, setImportedItems] = useState<CardBlockToItemMapping[]>(
		[]
	);
	const [relations, setRelations] = useState<BlockRelation[]>([]);

	const username = store.getState().userSettings.cbUsername;
	const password = store.getState().userSettings.cbPassword;

	const requestArgs = {
		method: "GET",
		headers: new Headers({
			"Content-Type": "text/plain",
			Authorization: `Basic ${btoa(username + ":" + password)}`,
		}),
	};

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Queries the editor extension for the currently existing cardBlocks on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create Card Blocks.
	 */
	React.useEffect(() => {
		setRelations([]);
		const handleCardBlocksData = async (
			data: CardBlockToCodeBeamerItemMapping[]
		) => {
			const cardBlockCodebeamerItemIdPairs = data.map(
				(x: {
					cardBlockId: string;
					codebeamerItemId: number;
					codebeamerTrackerId: number;
				}) => ({
					cardBlockId: x.cardBlockId,
					itemId: x.codebeamerItemId,
					trackerId: x.codebeamerTrackerId,
				})
			);
			setImportedItems(cardBlockCodebeamerItemIdPairs);

			if (!trackerId) return;
			// Get the Relations for each imported item thats in the current tracker
			const importedItemsForTracker = cardBlockCodebeamerItemIdPairs.filter(
				(i) => i.trackerId == Number(trackerId)
			);

			importedItemsForTracker.forEach(async (item) => {
				try {
					const relationsRes = await fetch(
						`${store.getState().boardSettings.cbAddress}/api/v3/items/${
							item.itemId
						}/relations`,
						requestArgs
					);
					const relationsQuery =
						(await relationsRes.json()) as RelationsQuery;

					// Iterate through the downstreamReferences and outgoingAssociations arrays
					[
						...relationsQuery.downstreamReferences,
						...relationsQuery.outgoingAssociations,
					].forEach((relation) => {
						const targetItemId = relation.itemRevision.id;

						const targetItems = cardBlockCodebeamerItemIdPairs.filter(
							(item) => item.itemId === targetItemId
						);
						targetItems.forEach(async (targetItem) => {
							let relationshipType = RelationshipType.DOWNSTREAM;

							if (relation.type === "OutgoingTrackerItemAssociation") {
								const associationRes = await fetch(
									`${
										store.getState().boardSettings.cbAddress
									}/api/v3/associations/${relation.id}`,
									requestArgs
								);
								const associationJson =
									(await associationRes.json()) as AssociationDetails;

								relationshipType = associationJson.type
									.name as RelationshipType;
							}

							const blockRelation = {
								sourceBlockId: item.cardBlockId,
								targetBlockId: targetItem.cardBlockId,
								type: relationshipType,
							};
							setRelations((relations) => [...relations, blockRelation]);
						});
					});
				} catch (error) {
					console.warn(
						`Failed to fetch relations for item ${item.itemId}:`,
						error
					);
				}
			});
		};

		messageHandler.getCardBlocks(handleCardBlocksData);
	}, [trackerId]);

	return { importedItems, relations };
};
