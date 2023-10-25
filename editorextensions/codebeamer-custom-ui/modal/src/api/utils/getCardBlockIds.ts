import { CardBlockToItemMapping } from '../../models/cardBlockToItemMapping.if';

export default function getCardBlockIds(
	codeBeamerItemId: number,
	importedItems: CardBlockToItemMapping[]
) {
	const matchingCardBlockToItemMappings = importedItems.filter(
		(x) => x.itemId === codeBeamerItemId
	);
	const cardBlockIds = matchingCardBlockToItemMappings.map((data) => {
		return data.cardBlockId;
	});

	return cardBlockIds;
}
