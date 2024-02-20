import { FieldValue } from '../../../common/models/api-query-types';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { DefaultFieldNames } from '../../../common/names';
import { CodebeamerClient } from '../net/codebeamerclient';

export async function updateCodebeamerItem(
	itemId: number,
	additions: {
		[fieldName: string]: unknown;
	},
	oAuthToken: string
): Promise<CodeBeamerItem> {
	const codebeamerClient = new CodebeamerClient(oAuthToken);

	const itemFields = await codebeamerClient.getItemFields(itemId);
	const editableItemFields = itemFields.editableFields;

	const fieldValues: FieldValue[] = [];

	for (const fieldName in additions) {
		// convert lucid field name to codebeamer api field name
		let codebeamerFieldName = '';
		if (fieldName === DefaultFieldNames.Name) {
			codebeamerFieldName = 'name';
		} else if (fieldName === DefaultFieldNames.Description) {
			codebeamerFieldName = 'description';
		} else if (fieldName === DefaultFieldNames.StoryPoints) {
			codebeamerFieldName = 'storyPoints';
		}

		// if the field is editable, add it to the list of fields to update
		if (codebeamerFieldName) {
			const field = editableItemFields.find(
				(field) => field.name === codebeamerFieldName
			);
			if (field) {
				fieldValues.push({
					fieldId: field.fieldId,
					type: field.type,
					name: field.name,
					value: additions[fieldName],
				});
			}
		}
	}

	const updatedCodebeamerItem = await codebeamerClient.updateItemFields(
		fieldValues,
		itemId
	);
	return updatedCodebeamerItem;
}
