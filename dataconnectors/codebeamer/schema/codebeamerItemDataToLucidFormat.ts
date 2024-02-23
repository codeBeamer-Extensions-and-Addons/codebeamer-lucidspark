import { DefaultFieldNames } from '../../../common/names';
import { CodebeamerItemType } from './codebeamerItemSchema';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { baseUrl } from '../../../common/names';

export function codebeamerItemDataToLucidFormat(
	item: CodeBeamerItem,
	projectId: number
): CodebeamerItemType {
	return {
		[DefaultFieldNames.Id]: item.id,
		[DefaultFieldNames.Name]: item.name,
		[DefaultFieldNames.Description]: item.description ?? null,
		[DefaultFieldNames.Assignee]: item.assignedTo[0]?.id.toString() ?? null,
		[DefaultFieldNames.Link]: `${baseUrl}/item/${item.id}`,
		[DefaultFieldNames.ProjectId]: projectId,
		[DefaultFieldNames.TrackerId]: item.tracker.id,
		[DefaultFieldNames.Team]: item.teams[0]?.id.toString() ?? null,
		[DefaultFieldNames.StoryPoints]: item.storyPoints ?? null,
		[DefaultFieldNames.Version]: item.version,
		[DefaultFieldNames.Status]: item.status.id.toString(),
		[DefaultFieldNames.Owner]: item.owners[0]?.id.toString() ?? null,
	};
}
