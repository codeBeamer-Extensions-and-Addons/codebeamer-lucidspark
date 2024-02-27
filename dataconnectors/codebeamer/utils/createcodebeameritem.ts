import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { DefaultFieldNames } from '../../../common/names';
import { CodebeamerClient } from '../net/codebeamerclient';

/**
 * Creates an item in codebeamer
 * currently only supporting the mocked api
 * @param additions fields of item to be created
 * @param oAuthToken OAuth token for authentication
 * @returns
 */
export async function createCodebeamerItem(
	additions: {
		[fieldName: string]: unknown;
	},
	oAuthToken: string
): Promise<CodeBeamerItem> {
	const codebeamerClient = new CodebeamerClient(oAuthToken);
	const trackerId = additions[DefaultFieldNames.TrackerId] as number;
	const name = additions[DefaultFieldNames.Name] as string;
	const description = additions[DefaultFieldNames.Description] as string;

	const requestBody = { name: name, description: description };

	const createdCodebeamerItem = await codebeamerClient.createItem(
		trackerId,
		requestBody
	);
	return createdCodebeamerItem;
}
