import React, { useState } from 'react';
import { CardBlockToItemMapping } from '../models/cardBlockToItemMapping.if';
import { MessageHandler, CardBlockData } from '../api/lucidGateway';
import { store } from '../store/store';
import { RelationsQuery } from '../models/api-query-types';

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToItemMapping}s matching the CardBlocks on the board.
 */
export const useImportedItems = (trackerId: string) => {
	const [importedItems, setImportedItems] = useState<
		CardBlockToItemMapping[]
	>([]);
	const [relations, setRelations] = useState<RelationsQuery[]>([]);

	const username = store.getState().userSettings.cbUsername;
	const password = store.getState().userSettings.cbPassword;

	const requestArgs = {
		method: 'GET',
		headers: new Headers({
			'Content-Type': 'text/plain',
			Authorization: `Basic ${btoa(username + ':' + password)}`,
		}),
	};

	const messageHandler = MessageHandler.getInstance();

	/**
	 * Queries the editor extension for the currently existing cardBlocks on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create Card Blocks.
	 */
	React.useEffect(() => {
		const handleCardBlocksData = async (data: CardBlockData[]) => {
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

			// Get the Relations for each imported item thats in the current tracker
			const importedItemsForTracker =
				cardBlockCodebeamerItemIdPairs.filter(
					(i) => i.trackerId == Number(trackerId)
				);

			const relations = await Promise.all(
				importedItemsForTracker.map(async (item) => {
					const relationsRes = await fetch(
						`${
							store.getState().boardSettings.cbAddress
						}/api/v3/items/${item.itemId}/relations`,
						requestArgs
					);
					const relations =
						(await relationsRes.json()) as RelationsQuery;
					return relations;
				})
			);
			setRelations(relations);
		};

		messageHandler.getCardBlocks(handleCardBlocksData);
	}, []);

	return { importedItems, relations };
};
