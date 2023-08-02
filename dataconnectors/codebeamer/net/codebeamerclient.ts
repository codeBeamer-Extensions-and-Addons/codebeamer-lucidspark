import {
	EntityReference,
	Item,
	ProjectSummary,
} from '../../../editorextensions/codebeamer-cards/src/model/codebeamermodel';
import axios, { AxiosResponse } from 'axios';

/**
 * Codebeamer API client implementation
 *
 * Abstracts codebeamer's swagger API
 *
 * Is indeed a de facto duplicate of the same class in the editorextension, except that this will
 * be hosted on a separate server and hence can't use the lucid xhr requests.
 * And the actual endpoints needed may differ.
 *
 * TODO make a single cb client with either axios or lucid-xhr strategy, which then just implement
 * TODO the make{Method}Request methods
 */
export class CodebeamerClient {
	/**
	 *
	 */
	constructor() {}

	// private readonly googleOAuthProviderName = 'google';

	private readonly baseUrl = 'https://retinatest.roche.com/cb/api/v3';

	private async makeGetRequest(url: string, ...params: any) {
		try {
			const response = await axios.get(`${this.baseUrl}${url}`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Basic ${token}',
				},
			});
			return response;
		} catch (error) {
			console.log('Error:', error);
			throw this.errorFromResponse(error);
		}
	}

	private errorFromResponse(response: any) {
		try {
			return this.parseAsAny(response).errors[0].message;
		} catch (error) {
			return new Error(JSON.stringify(response));
		}
	}

	private parseAsAny(data: AxiosResponse): any {
		return JSON.parse(data.data) as any;
	}

	public async getItem(itemId: string): Promise<Item> {
		const rawResponse = await this.makeGetRequest(`/items/${itemId}`);

		return this.parseAsAny(rawResponse) as Item;
	}

	public async getItems(
		itemIds: number[],
		projectId?: number,
		trackerId?: number
	): Promise<Item[]> {
		const rawResponse = await this.makeGetRequest(
			`/items/query?${this.getUrlQueryParams({
				page: 1,
				pageSize: 500,
				queryString: `${
					projectId ? 'project.id IN (' + projectId + ') AND ' : ''
				}${
					trackerId ? 'tracker.id IN (' + trackerId + ') AND ' : ''
				}item.id IN (${itemIds.join()})`,
			})}`
		);

		return this.parseAsAny(rawResponse)['items'] as Item[];
	}

	private getUrlQueryParams(params: { [key: string]: string | number }) {
		const queryParams = [];

		for (const key in params) {
			if (params.hasOwnProperty(key)) {
				const value = params[key];
				const encodedKey = encodeURIComponent(key);
				const encodedValue = encodeURIComponent(value);
				queryParams.push(`${encodedKey}=${encodedValue}`);
			}
		}

		return queryParams.join('&');
	}
}
