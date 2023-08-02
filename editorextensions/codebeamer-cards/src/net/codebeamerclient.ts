import {
	EditorClient,
	HumanReadableError,
	XHRResponse,
} from 'lucid-extension-sdk';
import {
	EntityReference,
	Item,
	ProjectSummary,
} from '../model/codebeamermodel';
import axios, { AxiosResponse } from 'axios';

/**
 * Codebeamer API client implementation
 *
 * Abstracts codebeamer's swagger API
 */
export class CodebeamerClient {
	/**
	 *
	 */
	constructor(private readonly client: EditorClient) {}

	// private readonly googleOAuthProviderName = 'google';

	private readonly baseUrl = 'https://retinatest.roche.com/cb/api/v3';

	private async makeGetRequest(url: string, ...params: any) {
		try {
			const response = this.client.xhr({
				url: `${this.baseUrl}${url}`,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Basic ${token}',
				},
			});

			// const response = await this.client.oauthXhr(
			// 	this.googleOAuthProviderName,
			// 	{
			// 		url,
			// 		method: 'GET',
			// 		responseFormat: 'utf8',
			// 	}
			// );
			return response;
		} catch (error) {
			console.log('Error:', error);
			throw this.errorFromResponse(error);
		}
	}

	private errorFromResponse(response: any) {
		try {
			return new HumanReadableError(
				this.parseAsAny(response).errors[0].message
			);
		} catch (error) {
			return new Error(JSON.stringify(response));
		}
	}

	private parseAsAny(data: XHRResponse): any {
		switch (data.responseFormat) {
			case 'utf8':
				return JSON.parse(data.responseText) as any;
			case 'binary':
				return JSON.parse(data.responseData as any) as any;
		}
	}

	public async getProjects(): Promise<ProjectSummary[]> {
		const rawResponse = await this.makeGetRequest(`/projects`);

		return this.parseAsAny(rawResponse) as ProjectSummary[];
	}

	public async getTrackers(projectId: number): Promise<EntityReference[]> {
		const rawResponse = await this.makeGetRequest(
			`/projects/${projectId}/trackers`
		);

		return this.parseAsAny(rawResponse) as EntityReference[];
	}

	public async getItem(itemId: string): Promise<Item> {
		const rawResponse = await this.makeGetRequest(`/items/${itemId}`);

		return this.parseAsAny(rawResponse) as Item;
	}

	public async searchItems(
		summary: string,
		projectId?: number,
		trackerId?: number
	): Promise<Item[]> {
		const rawResponse = await this.makeGetRequest(
			`/items/query?${this.getUrlQueryParams({
				page: 1,
				pageSize: 50,
				queryString: `${
					projectId ? 'project.id IN (' + projectId + ') AND ' : ''
				}${
					trackerId ? 'tracker.id IN (' + trackerId + ') AND ' : ''
				}summary LIKE '%${summary}%'`,
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
