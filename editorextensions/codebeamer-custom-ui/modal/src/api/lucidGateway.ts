import { CodeBeamerItem } from '../models/codebeamer-item.if';
import getItemColorField from './utils/getItemColorField';
import { store } from '../store/store';
import TrackerDetails from '../models/trackerDetails.if';
import { CardData } from '../models/lucidCardData';
import { RelationshipType } from '../enums/associationRelationshipType.enum';
import { getColorForRelationshipType } from './utils/getColorForRelationshipType';

/**
 * Class for handling message events and callbacks.
 */
export class MessageHandler {
	private callbacks: Map<MessageAction, ((data: []) => void)[]> = new Map();

	/**
	 * Private instance to hold the singleton instance.
	 * @type {MessageHandler | null}
	 * @private
	 */
	private static instance: MessageHandler | null = null;

	/**
	 * Private constructor to prevent direct instantiation. Sets up a message event listener.
	 * @private
	 */
	private constructor() {
		window.addEventListener('message', (e) => {
			const data = JSON.parse(e.data);
			this.notifyCallbacks(data);
		});
	}

	/**
	 * Gets the singleton instance of the MessageHandler.
	 * If the instance doesn't exist, it creates one.
	 * @returns {MessageHandler} The singleton instance of MessageHandler.
	 * @static
	 */
	public static getInstance(): MessageHandler {
		if (!MessageHandler.instance) {
			MessageHandler.instance = new MessageHandler();
		}
		return MessageHandler.instance;
	}

	/**
	 * Requests card blocks from the parent window and registers a callback to handle the response.
	 * @param {function} callback - The callback function that will be called with the received card block data.
	 */
	getCardBlocks(callback: (data: CardBlockData[]) => void) {
		this.subscribeCallback(MessageAction.GET_CARD_BLOCKS, callback);
		LucidGateway.requestCardBlockData();
	}

	/**
	 * Requests lines from the parent window and registers a callback to handle the response.
	 * @param {function} callback - The callback function that will be called with the received line data.
	 */
	getLines(callback: (data: LineData[]) => void) {
		this.subscribeCallback(MessageAction.GET_LINES, callback);
		LucidGateway.requestLineData();
	}

	subscribeCallback(action: MessageAction, callback: (data: []) => void) {
		const actionCallbacks = this.callbacks.get(action) || [];
		actionCallbacks.push(callback);
		this.callbacks.set(action, actionCallbacks);
	}

	unsubscribeCallback(action: MessageAction, callback: (data: []) => void) {
		const actionCallbacks = this.callbacks.get(action) || [];
		const index = actionCallbacks.indexOf(callback);
		if (index !== -1) {
			actionCallbacks.splice(index, 1);
		}
		this.callbacks.set(action, actionCallbacks);
	}

	/**
	 * Notifies registered callbacks with message data.
	 * @param data - The data received in the message.
	 */
	private notifyCallbacks(data: IncomingMessage) {
		const actionCallbacks = this.callbacks.get(data.action);
		if (actionCallbacks) {
			actionCallbacks.forEach((callback) => {
				callback(data.payload as []);
				this.unsubscribeCallback(data.action, callback);
			});
		}
	}
}

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
	payload: LineData[] | CardBlockData[];
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
	sourceBlockId: string;
	targetBlockId: string;
	relationshipType: RelationshipType;
	lineColor: string;
}

// Interface for payload specific to the DELETE_LINE action
export interface DeleteLinePayload {
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
	IMPORT_ITEM = 'importItem',
	UPDATE_CARD = 'updateCard',
	CREATE_LINE = 'createLine',
	DELETE_LINE = 'deleteLine',
	START_IMPORT = 'startImport',
	CLOSE_MODAL = 'closeModal',
}

/**
 * Interface for card block data.
 */
export interface CardBlockData {
	cardBlockId: string;
	codebeamerItemId: number;
	codebeamerTrackerId: number;
}

/**
 * Interface for line data
 */
export interface LineData {
	id: string;
	sourceBlockId: string;
	targetBlockId: string;
}

/**
 * Structure of a Relation with the specific block ids
 */
export interface BlockRelation {
	sourceBlockId: string;
	targetBlockId: string;
	type: RelationshipType;
}

export class LucidGateway {
	/**
	 * Create an application card with import details.
	 * @param importId - The import ID.
	 * @param item - The CodeBeamerItem.
	 * @param coordinates - Optional coordinates for the card.
	 */
	public static async createAppCard(
		importId: number,
		item: CodeBeamerItem,
		coordinates?: { x: number; y: number }
	) {
		const cardData = await this.convertToCardData(item, coordinates);
		this.postMessage({
			action: MessageAction.IMPORT_ITEM,
			payload: { importId, cardData },
		});
	}

	/**
	 * Update an application card with item details.
	 * @param item - The CodeBeamerItem to update the card with.
	 * @param cardBlockId - The ID of the card block to update.
	 */
	public static async updateAppCard(
		item: CodeBeamerItem,
		cardBlockId: string
	) {
		const cardData = await this.convertToCardData(item);
		this.postMessage({
			action: MessageAction.UPDATE_CARD,
			payload: { cardData, cardBlockId },
		});
	}

	/**
	 * Create a line between two card blocks
	 * @param sourceBlockId - The ID of the source card block.
	 * @param targetBlockId - The ID of the target card block.
	 * @param relationshipType - The type of relationship between the codebeamer items on the two card blocks.
	 */
	public static async createLine(
		sourceBlockId: string,
		targetBlockId: string,
		relationshipType: RelationshipType
	) {
		const lineColor = getColorForRelationshipType(relationshipType);

		this.postMessage({
			action: MessageAction.CREATE_LINE,
			payload: {
				sourceBlockId,
				targetBlockId,
				relationshipType,
				lineColor,
			},
		});
	}

	/**
	 * Convert a CodeBeamer item to card data.
	 * @param item - The CodeBeamerItem to convert.
	 * @param coordinates - Optional coordinates for the card.
	 * @returns The CardData representing the item.
	 */
	private static async convertToCardData(
		item: CodeBeamerItem,
		coordinates?: { x: number; y: number }
	): Promise<CardData> {
		const description = item.description;
		const username = store.getState().userSettings.cbUsername;
		const password = store.getState().userSettings.cbPassword;
		const cbBaseAddress = store.getState().boardSettings.cbAddress;

		const headers = new Headers({
			'Content-Type': 'text/plain',
			Authorization: `Basic ${btoa(username + ':' + password)}`,
		});

		// if (item.descriptionFormat == DescriptionFormat.WIKI) {
		// 	//get the formatted description
		// 	try {
		// 		const wiki2htmlRes = await fetch(
		// 			`${cbBaseAddress}/rest/item/${item.id}/wiki2html`,
		// 			{ method: 'POST', body: item.description, headers }
		// 		);
		// 		const html = await wiki2htmlRes.text();
		// 		description = html;
		// 	} catch (e: any) {
		// 		//* It can in fact take ~1 minute until the request actually fails.
		// 		//* Issue lies with codeBeamers inability to accept its failure in converting some wiki2html
		// 		//* and a custom timeout seams impossible
		// 		const message = `Failed fetching formatted description for Item ${item.name}.`;
		// 		console.warn(message);
		// 	}
		// }

		//get the tracker details
		try {
			const trackerRes = await fetch(
				`${cbBaseAddress}/api/v3/trackers/${item.tracker.id}`,
				{ method: 'GET', headers }
			);
			const trackerJson = (await trackerRes.json()) as TrackerDetails;
			item.tracker.keyName = trackerJson.keyName;
			item.tracker.color = trackerJson.color;
		} catch (error) {
			const message = `Failed fetching tracker details for Item ${item.name}.`;
			console.warn(message);
		}

		const cardData: CardData = {
			// id: item.id.toString(),
			// title: getCardTitle(
			// 	item.id.toString(),
			// 	item.name,
			// 	item.tracker.keyName
			// ),
			codebeamerItemId: item.id,
			codebeamerTrackerId: item.tracker.id,
			title: item.name,
			description: description,
			coordinates: coordinates,
		};

		if (item.assignedTo[0]) cardData.assignee = item.assignedTo[0].name;
		if (item.storyPoints) cardData.estimate = item.storyPoints;

		// background Color
		const colorFieldValue = getItemColorField(item);
		const backgroundColor = colorFieldValue
			? colorFieldValue
			: item.tracker.color
			? item.tracker.color
			: null;
		if (backgroundColor) {
			cardData.style = { cardTheme: backgroundColor };
		}

		return cardData;
	}

	/**
	 * Start an import with specified ID and total items.
	 * @param id - The import ID.
	 * @param items - The total number of items to import.
	 */
	public static startImport(id: number, items: number) {
		this.postMessage({
			action: MessageAction.START_IMPORT,
			payload: { id: id, totalItems: items },
		});
	}

	/**
	 * Request card block data from the parent window.
	 */
	public static requestCardBlockData() {
		this.postMessage({
			action: MessageAction.GET_CARD_BLOCKS,
		});
	}

	/**
	 * Request line data from the parent window.
	 */
	public static requestLineData() {
		this.postMessage({
			action: MessageAction.GET_LINES,
		});
	}

	/**
	 * Delete a line by id
	 */
	public static deleteLine(lineId: string) {
		this.postMessage({
			action: MessageAction.DELETE_LINE,
			payload: { lineId },
		});
	}

	/**
	 * Call this function to close the modal.
	 */
	public static closeModal() {
		this.postMessage({ action: MessageAction.CLOSE_MODAL });
	}

	/**
	 * Post a message to the parent window.
	 */
	private static postMessage(message: Message) {
		window.parent.postMessage(message, '*');
	}
}
