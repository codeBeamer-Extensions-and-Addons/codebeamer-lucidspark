import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { CodebeamerClient } from '../net/codebeamerclient';

/**
 * Get Codebeamer Items by ids, without a tracker id
 * @param itemIds ids of the items to fetch
 * @param oAuthToken OAuth token for authentication
 * @returns
 */
export async function fetchItemsByIds(
	itemIds: Set<number>,
	oAuthToken: string
): Promise<{ item: CodeBeamerItem; projectId: number }[]> {
	const codebeamerClient = new CodebeamerClient(oAuthToken);

	const fullTaskData = Array.from(itemIds, async (itemId) => {
		const fullTaskData = await codebeamerClient.getItem(itemId);
		const tracker = await codebeamerClient.getTracker(
			fullTaskData.tracker.id
		);
		const projectId = tracker.project.id;

		return { item: fullTaskData, projectId };
	});
	return Promise.all(fullTaskData);
}
