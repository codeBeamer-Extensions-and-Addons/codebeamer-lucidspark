import React, { useState } from 'react';
import { store } from '../store/store';
import { RelationsQuery, AssociationDetails } from '../models/api-query-types';
import { RelationshipType } from '../enums/associationRelationshipType.enum';
import { CardBlockToCodebeamerItemMapping } from '../models/lucidCardData';
import { MessageHandler } from '../api/messageHandler';
import { BlockRelation } from '../models/lucidLineData';
import { MessageAction } from '../models/messageInterfaces';

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToCodebeamerItemMapping}s matching the CardBlocks on the board.
 */
export const useImportedItems = (trackerId?: string) => {
	const [importedItems, setImportedItems] = useState<
		CardBlockToCodebeamerItemMapping[]
	>([]);
	const [relations, setRelations] = useState<BlockRelation[]>([]);
	const [isLoadingRelations, setIsLoadingRelations] = useState(false);
	const [areAllRelationsLoaded, setAreAllRelationsLoaded] = useState(false);
	const itemsThreshold = 50;

	const oAuthToken = store.getState().userSettings.oAuthToken;

	const requestArgs = {
		method: 'GET',
		headers: new Headers({
			'Content-Type': 'text/plain',
			Authorization: `Bearer ${oAuthToken}`,
		}),
	};

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Fetches the relations for the given items.
	 * @param items The items to fetch the relations for
	 */
	const fetchRelations = async (
		allItemsOnBoard: CardBlockToCodebeamerItemMapping[]
	) => {
		setIsLoadingRelations(true);

		const importedItemsForTracker = allItemsOnBoard.filter(
			(i) => i.codebeamerTrackerId == Number(trackerId)
		);

		let blockRelations: BlockRelation[] = [];

		try {
			const allBlockRelations = await Promise.all(
				importedItemsForTracker.map(async (item) => {
					const relationsRes = await fetch(
						`${store.getState().boardSettings.cbAddress}/api/v3/items/${
							item.codebeamerItemId
						}/relations`,
						requestArgs
					);
					const relationsQuery =
						(await relationsRes.json()) as RelationsQuery;

					// Process relations
					const relationPromises = relationsQuery.downstreamReferences
						.concat(relationsQuery.outgoingAssociations)
						.map(async (relation) => {
							const targetItemId = relation.itemRevision.id;

							const targetItems = allItemsOnBoard.filter(
								(innerItem) =>
									innerItem.codebeamerItemId === targetItemId
							);

							return Promise.all(
								targetItems.map(async (targetItem) => {
									let relationshipType = RelationshipType.DOWNSTREAM;

									if (
										relation.type === 'OutgoingTrackerItemAssociation'
									) {
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

									return blockRelation;
								})
							);
						});

					// Wait for all relation processing to complete
					const relations = await Promise.all(relationPromises);
					// Flatten the array of arrays into a single array
					return relations.flat();
				})
			);

			// Flatten the array of arrays into a single array of relations
			blockRelations = allBlockRelations.flat();
			setRelations(blockRelations);
		} catch (error) {
			console.warn('Failed to fetch relations:', error);
		}
		setIsLoadingRelations(false);
		setAreAllRelationsLoaded(true);
		return blockRelations;
	};

	/**
	 * Queries the editor extension for the currently existing cardBlocks on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create Card Blocks.
	 */
	React.useEffect(() => {
		setRelations([]);
		setAreAllRelationsLoaded(false);
		const handleCardBlocksData = async (
			data: CardBlockToCodebeamerItemMapping[]
		) => {
			setImportedItems(data);

			if (!trackerId) return;
			// Get the Relations for each imported item thats in the current tracker if there are less than 50
			if (
				data.filter((i) => i.codebeamerTrackerId == Number(trackerId))
					.length <= itemsThreshold
			) {
				const blockRelations = await fetchRelations(data);
				setRelations(blockRelations);
			}
		};

		messageHandler.getCardBlocks(handleCardBlocksData);

		return () => {
			messageHandler.unsubscribeCallback(
				MessageAction.GET_CARD_BLOCKS,
				handleCardBlocksData
			);
		};
	}, [trackerId]);

	return {
		importedItems,
		relations,
		isLoadingRelations,
		fetchRelations,
		areAllRelationsLoaded,
	};
};
