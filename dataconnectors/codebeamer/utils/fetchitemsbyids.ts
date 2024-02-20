import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { CodebeamerClient } from '../net/codebeamerclient';

export async function fetchItemsByIds(
	itemIds: Set<number>,
	oAuthToken: string
): Promise<CodeBeamerItem[]> {
	const codebeamerClient = new CodebeamerClient(oAuthToken);

	const fullTaskData = Array.from(itemIds, async (itemId) => {
		const fullTaskData = await codebeamerClient.getItem(itemId);
		return fullTaskData;
	});
	return Promise.all(fullTaskData);
}
