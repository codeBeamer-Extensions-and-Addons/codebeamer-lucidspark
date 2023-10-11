/**
 * Map appCard and item together, because their ids are both auto generated by their respective systems.
 */
export interface CardBlockToItemMapping {
	cardBlockId: string;
	itemId: number;
}
