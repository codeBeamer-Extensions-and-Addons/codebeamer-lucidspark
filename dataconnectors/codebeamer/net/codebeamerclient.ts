/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectListView } from '../../../common/models/projectListView.if';
import { TrackerListView } from '../../../common/models/trackerListView.if';
import {
	CodeBeamerItemField,
	ItemQueryPage,
	TransitionDetails,
} from '../../../common/models/api-query-types';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';
import axios from 'axios';
import { baseUrl } from '../../../common/names';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { CodeBeamerItemFields } from '../../../common/models/api-query-types';
import { CodeBeamerUserReference } from '../../../common/models/codebeamer-user-reference.if';

export class CodebeamerClient {
	constructor(private readonly oAuthToken: string) {}
	// create headers with oauth token
	private readonly headers = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${this.oAuthToken}`,
	};

	private readonly baseUrl = baseUrl;

	public async getProjects(): Promise<ProjectListView[]> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects`
		);
		return rawResponse as any as ProjectListView[];
	}

	public async getTrackers(projectId: number): Promise<TrackerListView[]> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects/${projectId}/trackers`
		);
		return rawResponse as any as TrackerListView[];
	}

	public async getItems(body: CbqlApiQuery): Promise<ItemQueryPage> {
		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/items/query`,
			body
		);
		return rawResponse as any as ItemQueryPage;
	}

	public async getItem(itemId: number): Promise<CodeBeamerItem> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/items/${itemId}`
		);
		return rawResponse as any as CodeBeamerItem;
	}

	public async getItemFields(itemId: number): Promise<CodeBeamerItemFields> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/items/${itemId}/fields`
		);
		return rawResponse as any as CodeBeamerItemFields;
	}

	public async updateItemFields(
		fieldValues: CodeBeamerItemField[],
		itemId: number
	) {
		const rawResponse = await this.makePutRequest(
			`${this.baseUrl}/api/v3/items/${itemId}/fields`,
			{
				fieldValues: fieldValues,
			}
		);
		return rawResponse as any as CodeBeamerItem;
	}

	public async getUserByName(name: string): Promise<CodeBeamerUserReference> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/users/findByName?name=${name}`,
			true
		);
		return rawResponse as any as CodeBeamerUserReference;
	}

	public async getUserById(userId: number): Promise<CodeBeamerUserReference> {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/users/${userId}`,
			true
		);
		return rawResponse as any as CodeBeamerUserReference;
	}

	public async getTransitions(itemId: number) {
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/items/${itemId}/transitions`
		);
		return rawResponse as any as TransitionDetails[];
	}

	private async makeGetRequest(url: string, allow404?: boolean) {
		try {
			const { data } = await axios.get<any>(url, {
				headers: this.headers,
			});
			return data;
		} catch (error) {
			if (!allow404) {
				if (axios.isAxiosError(error)) {
					console.log('error message: ', error.message);
					return error.message;
				} else {
					console.log('unexpected error: ', error);
					return 'An unexpected error occurred';
				}
			}
		}
	}

	private async makePostRequest(url: string, body: any) {
		try {
			const { data } = await axios.post(url, body, {
				headers: this.headers,
			});
			return data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.log('error message: ', error.message);
				return error.message;
			} else {
				console.log('unexpected error: ', error);
				return 'An unexpected error occurred';
			}
		}
	}

	private async makePutRequest(url: string, body: any) {
		try {
			const { data } = await axios.put(url, body, {
				headers: this.headers,
			});
			return data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.log(
					'error message: ',
					(error.response?.data as any)?.message
				);
				return (error.response?.data as any)?.message;
			} else {
				console.log('unexpected error: ', error);
				return 'An unexpected error occurred';
			}
		}
	}
}
