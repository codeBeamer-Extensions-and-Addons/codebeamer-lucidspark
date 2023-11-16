import { CardBlockToCodebeamerItemMapping } from '../models/lucidCardData';
import { LucidLineData } from '../models/lucidLineData';
import { IncomingMessage, MessageAction } from '../models/messageInterfaces';
import { LucidGateway } from './lucidGateway';

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
	getCardBlocks(callback: (data: CardBlockToCodebeamerItemMapping[]) => void) {
		this.subscribeCallback(MessageAction.GET_CARD_BLOCKS, callback);
		LucidGateway.requestCardBlockData();
	}

	/**
	 * Requests lines from the parent window and registers a callback to handle the response.
	 * @param {function} callback - The callback function that will be called with the received line data.
	 */
	getLines(callback: (data: LucidLineData[]) => void) {
		this.subscribeCallback(MessageAction.GET_LINES, callback);
		LucidGateway.requestLineData();
	}

	subscribeCallback(action: MessageAction, callback: (data: []) => void) {
		const actionCallbacks = this.callbacks.get(action) || [];
		actionCallbacks.push(callback);
		this.callbacks.set(action, actionCallbacks);
	}

	unsubscribeCallback(action: MessageAction, callback: (data: []) => void) {
		const actionCallbacks = this.callbacks.get(action);
		if (actionCallbacks) {
			this.callbacks.set(
				action,
				actionCallbacks.filter((cb) => cb !== callback)
			);
		}
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
			});
		}
	}
}
