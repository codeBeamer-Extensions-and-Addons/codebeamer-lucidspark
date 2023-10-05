import { AppCard } from '@mirohq/websdk-types';
import React, { useState } from 'react';
import { CARD_TITLE_ID_FILTER_REGEX } from '../constants/regular-expressions';
import { CardBlockToItemMapping } from '../models/cardBlockToItemMapping.if';
import { CodeBeamerItem } from '../models/codebeamer-item.if';

/**
 * Queries the CardBlocks present on the Lucid board
 * @returns An array of ${@link CardBlockToItemMapping}s matching the AppCards on the board.
 */
export const useImportedItems = () => {
	const [importedItems, setImportedItems] = useState<
		CardBlockToItemMapping[]
	>([]);

	/**
	 * Queries miro for the currently existing app_cards on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create App Cards.
	 */
	React.useEffect(() => {
		miro.board.get({ type: 'app_card' }).then(async (existingCards) => {
			const importedItems = await Promise.all(
				existingCards.map(async (e) => {
					let card = e as AppCard;
					let itemId;

					try {
						itemId = (
							(await card.getMetadata('item')) as Pick<
								CodeBeamerItem,
								'id'
							>
						).id.toString();
					} catch (err: any) {
						//fallback for backwards-compatibility
						const itemKey = card.title.match(
							CARD_TITLE_ID_FILTER_REGEX
						);

						if (!itemKey?.length) {
							const message =
								"Couldn't extract ID from Card title. Can't sync!";
							console.error(message);
							miro.board.notifications.showError(message);
							return { appCardId: card.id, itemId: '' };
						}
						itemId = itemKey[1];
					}

					return { appCardId: card.id, itemId: itemId };
				})
			);
			setImportedItems(importedItems);
		});
	}, []);

	return importedItems;
};
