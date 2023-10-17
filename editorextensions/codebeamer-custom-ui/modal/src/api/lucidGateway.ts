import { Association, ItemMetadata } from '../models/api-query-types';
import { CodeBeamerItem } from '../models/codebeamer-item.if';
import getItemColorField from './utils/getItemColorField';
import { store } from '../store/store';
import TrackerDetails from '../models/trackerDetails.if';
import { CardData } from '../models/lucidCardData';

/**
 * Class for handling message events and callbacks.
 */
export class MessageHandler {
	private callbacks: ((data: any) => void)[] = [];

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
	getCardBlocks(callback: (arg0: any) => void) {
		this.subscribeCallback(callback);

		LucidGateway.requestCardBlockData();
	}

	/**
	 * Register a callback function to handle messages.
	 * @param callback - The callback function to register.
	 */
	subscribeCallback(callback: (data: any) => void) {
		this.callbacks.push(callback);
	}

	/**
	 * Unregister a previously registered callback function.
	 * @param callback - The callback function to unregister.
	 */
	unsubscribeCallback(callback: (data: any) => void) {
		const index = this.callbacks.indexOf(callback);
		if (index !== -1) {
			this.callbacks.splice(index, 1);
		}
	}

	/**
	 * Notifies registered callbacks with message data.
	 * @param data - The data received in the message.
	 */
	private notifyCallbacks(data: any) {
		this.callbacks.forEach((callback) => callback(data));
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
	payload: any;
}

/**
 * action enum for message actions
 */
export enum MessageAction {
	GET_CARD_BLOCKS = 'getCardBlocks',
	IMPORT_ITEM = 'importItem',
	UPDATE_CARD = 'updateCard',
	CREATE_CONNECTORS = 'createConnectors',
	START_IMPORT = 'startImport',
	CLOSE_MODAL = 'closeModal',
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

	public static async createConnectors(
		fromCard: string,
		toCards: number[],
		associations: Association[],
		existingAssociations: any[],
		metaData: ItemMetadata[]
	) {
		throw new Error('Not implemented');
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
		let description = item.description;
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
		} catch (e: any) {
			const message = `Failed fetching tracker details for Item ${item.name}.`;
			console.warn(message);
		}

		let cardData: CardData = {
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
		let colorFieldValue = getItemColorField(item);
		let backgroundColor = colorFieldValue
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
			payload: {},
		});
	}

	/**
	 * Call this function to close the modal.
	 */
	public static closeModal() {
		this.postMessage({ action: MessageAction.CLOSE_MODAL, payload: {} });
	}

	/**
	 * Post a message to the parent window.
	 */
	private static postMessage(message: Message) {
		window.parent.postMessage(message, '*');
	}
}
