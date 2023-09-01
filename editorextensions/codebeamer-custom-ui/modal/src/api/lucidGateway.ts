import { Association, ItemMetadata } from '../models/api-query-types';
import { CodeBeamerItem } from '../models/codebeamer-item.if';

export async function createAppCard(item: CodeBeamerItem) {
	throw new Error('Not implemented');
}

export async function updateAppCard(
	item: CodeBeamerItem,
	cardId: string,
	iForgotWhatThisParamWasAbout?: boolean
) {
	throw new Error('Not implemented');
}

export async function createConnectors(
	fromCard: string,
	toCards: number[],
	associations: Association[],
	existingAssociations: any[],
	metaData: ItemMetadata[]
) {
	throw new Error('Not implemented');
}
