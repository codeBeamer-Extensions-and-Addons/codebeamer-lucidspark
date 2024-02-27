/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	EditorClient,
	HumanReadableError,
	XHRResponse,
} from 'lucid-extension-sdk';
import { ProjectListView } from '../../../../common/models/projectListView.if';
import { TrackerListView } from '../../../../common/models/trackerListView.if';
import {
	ItemQueryPage,
	TrackerSearchPage,
	TransitionDetails,
	UserQueryPage,
	tokenInfo,
} from '../../../../common/models/api-query-types';
import { CbqlApiQuery } from '../../../../common/models/cbqlApiQuery';
import { baseUrl } from '../../../../common/names';
import TrackerDetails from '../../../../common/models/trackerDetails.if';

export class CodebeamerClient {
	private readonly headers = {};
	constructor(private readonly client: EditorClient) {
		this.headers = {
			'Content-Type': 'application/json',
		};
	}

	private readonly baseUrl = baseUrl;

	public async getProjects(): Promise<ProjectListView[]> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects`
		);
		return this.parseAsAny(rawResponse) as ProjectListView[];
	}

	public async getTrackers(projectId: number): Promise<TrackerListView[]> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects/${projectId}/trackers`
		);
		return this.parseAsAny(rawResponse) as TrackerListView[];
	}

	public async getTracker(trackerId: number): Promise<TrackerDetails> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/trackers/${trackerId}`
		);
		return this.parseAsAny(rawResponse) as TrackerDetails;
	}

	public async getItems(body: CbqlApiQuery): Promise<ItemQueryPage> {
		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/items/query`,
			body
		);
		return this.parseAsAny(rawResponse) as ItemQueryPage;
	}

	public async searchUsers(
		username: string,
		projectId: number
	): Promise<UserQueryPage> {
		let parameters = {};
		if (username == '') {
			parameters = {
				projectId: projectId,
			};
		} else {
			parameters = {
				projectId: projectId,
				// due to the codebeamer api, this sadly has to match the username exactly
				name: username,
			};
		}

		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/users/search`,
			parameters
		);
		return this.parseAsAny(rawResponse) as UserQueryPage;
	}

	public async getTokenInfo(oAuthToken: string) {
		const rawResponse = await this.client.xhr({
			url: `https://oauth2.googleapis.com/tokeninfo?id_token=${oAuthToken}`,
		});
		return this.parseAsAny(rawResponse) as tokenInfo;
	}

	public async getTeamTracker(projectId: number) {
		const body = {
			types: [
				{
					id: 150,
					name: 'Team',
					type: 'TrackerTypeReference',
				},
			],
		};
		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/projects/${projectId}/trackers/search`,
			body
		);
		return (this.parseAsAny(rawResponse) as TrackerSearchPage).trackers[0];
	}

	public async getTransitions(itemId: number) {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/items/${itemId}/transitions`
		);
		return this.parseAsAny(rawResponse) as TransitionDetails[];
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

	private async makeGetRequest(url: string) {
		try {
			const response = await this.client.oauthXhr('google', {
				url,
				responseFormat: 'utf8',
				method: 'GET',
				headers: this.headers,
			});
			return response;
		} catch (error) {
			console.log('Error:', error);
			throw this.errorFromResponse(error);
		}
	}

	private async makePostRequest(url: string, data: any) {
		try {
			const response = await this.client.oauthXhr('google', {
				url,
				responseFormat: 'utf8',
				method: 'POST',
				data: JSON.stringify(data),
				headers: this.headers,
			});
			return response;
		} catch (error) {
			console.log('Error:', error);
			throw this.errorFromResponse(error);
		}
	}
}
