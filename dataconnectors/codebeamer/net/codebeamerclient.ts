/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProjectListView } from '../../../common/models/projectListView.if';
import { TrackerListView } from '../../../common/models/trackerListView.if';
<<<<<<< Updated upstream
import { ItemQueryPage } from '../../../common/models/api-query-types';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';
import axios from 'axios';
import { baseUrl } from '../../../common/names';
=======
import {
	FieldValue,
	ItemQueryPage,
} from '../../../common/models/api-query-types';
import { CbqlApiQuery } from '../../../common/models/cbqlApiQuery';
import axios from 'axios';
import { baseUrl } from '../../../common/names';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { CodeBeamerItemFields } from '../../../common/models/api-query-types';
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
	public async getTrackers(projectId: string): Promise<TrackerListView[]> {
=======
	public async getTrackers(projectId: number): Promise<TrackerListView[]> {
>>>>>>> Stashed changes
		const rawResponse = await this.makeGetRequest(
			`${this.baseUrl}/api/v3/projects/${projectId}/trackers`
		);
		return rawResponse as any as TrackerListView[];
	}

	public async getItems(parameters: CbqlApiQuery): Promise<ItemQueryPage> {
		const rawResponse = await this.makePostRequest(
			`${this.baseUrl}/api/v3/items/query`,
			parameters
		);
		return rawResponse as any as ItemQueryPage;
	}

<<<<<<< Updated upstream
=======
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

	public async updateItemFields(fieldValues: FieldValue[], itemId: number) {
		const rawResponse = await this.makePutRequest(
			`${this.baseUrl}/api/v3/items/${itemId}/fields`,
			{
				fieldValues: fieldValues,
			}
		);
		return rawResponse as any as CodeBeamerItem;
	}

>>>>>>> Stashed changes
	private async makeGetRequest(url: string) {
		try {
			const { data } = await axios.get<any>(url, {
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
<<<<<<< Updated upstream
=======

	private async makePutRequest(url: string, body: any) {
		try {
			const { data } = await axios.put(url, body, {
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
>>>>>>> Stashed changes
}
