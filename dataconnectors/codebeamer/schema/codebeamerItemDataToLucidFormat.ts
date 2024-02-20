import { DefaultFieldNames } from '../../../common/names';
import { CodebeamerItemType } from './codebeamerItemSchema';

export function codebeamerItemDataToLucidFormat(codebeamerItem: {
	id: number;
	name: string;
}): CodebeamerItemType {
	return {
		[DefaultFieldNames.Id]: codebeamerItem.id,
		[DefaultFieldNames.Name]: codebeamerItem.name,
	};
}
