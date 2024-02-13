import { RelationshipType } from '../enums/associationRelationshipType.enum';
import { CardBlockToCodebeamerItemMapping, CardData } from './lucidCardData';
import { LucidLineData } from './lucidLineData';

/**
 * Interface for a message object with an action and payload.
 * @interface Message
 * @property action - The action to perform.
 * @property payload - The payload for the action.
 */
export interface Message {
	action: MessageAction;
	payload?:
		| ImportItemPayload
		| UpdateCardPayload
		| StartImportPayload
		| CreateLinePayload
		| DeleteLinePayload;
}

export interface IncomingMessage {
	action: MessageAction;
	payload: LucidLineData[] | CardBlockToCodebeamerItemMapping[];
}

// Interface for payload specific to the IMPORT_ITEM action
export interface ImportItemPayload {
	importId: number;
	cardData: CardData;
}

// Interface for payload specific to the UPDATE_CARD action
export interface UpdateCardPayload {
	cardData: CardData;
	cardBlockId: string;
}

// Interface for payload specific to the CREATE_LINE action
export interface CreateLinePayload {
	importId: number;
	sourceBlockId: string;
	targetBlockId: string;
	relationshipType: RelationshipType;
	lineColor: string;
}

// Interface for payload specific to the DELETE_LINE action
export interface DeleteLinePayload {
	importId: number;
	lineId: string;
}

// Interface for payload specific to the START_IMPORT action
export interface StartImportPayload {
	id: number;
	totalItems: number;
}

/**
 * action enum for message actions
 */
export enum MessageAction {
	GET_CARD_BLOCKS = 'getCardBlocks',
	GET_LINES = 'getLines',
	GET_OAUTH_TOKEN = 'getOAuthToken',
	IMPORT_ITEM = 'importItem',
	UPDATE_CARD = 'updateCard',
	CREATE_LINE = 'createLine',
	DELETE_LINE = 'deleteLine',
	START_IMPORT = 'startImport',
	CLOSE_MODAL = 'closeModal',
}
