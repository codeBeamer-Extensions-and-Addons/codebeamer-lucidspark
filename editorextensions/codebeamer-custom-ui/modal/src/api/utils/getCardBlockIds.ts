import { CardBlockToCodebeamerItemMapping } from "../../models/lucidCardData";

export default function getCardBlockIds(
	codeBeamerItemId: number,
	importedItems: CardBlockToCodebeamerItemMapping[]
) {
	const matchingCardBlockToCodebeamerItemMappings = importedItems.filter(
		(x) => x.codebeamerItemId === codeBeamerItemId
	);
	const cardBlockIds = matchingCardBlockToCodebeamerItemMappings.map(
		(data) => {
			return data.cardBlockId;
		}
	);

	return cardBlockIds;
}
