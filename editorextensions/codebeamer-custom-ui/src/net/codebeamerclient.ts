import {
	EditorClient,
	HumanReadableError,
	XHRResponse,
} from 'lucid-extension-sdk';
import { ProjectListView } from '../../../../common/models/projectListView.if';
import { TrackerListView } from '../../../../common/models/trackerListView.if';
import { ItemQueryPage } from '../../../../common/models/api-query-types';
import { CbqlApiQuery } from '../../../../common/models/cbqlApiQuery';
import { baseUrl } from '../../../../common/names';

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

	public async getTrackers(projectId: string): Promise<TrackerListView[]> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects/${projectId}/trackers`
		);
		return this.parseAsAny(rawResponse) as TrackerListView[];
	}

	public async getItems(parameters: CbqlApiQuery): Promise<ItemQueryPage> {
		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/items/query`,
			parameters
		);
		return this.parseAsAny(rawResponse) as ItemQueryPage;
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
