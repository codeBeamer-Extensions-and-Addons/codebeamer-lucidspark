import { CodeBeamerItemField } from '../../../common/models/api-query-types';
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

	const fieldValues: CodeBeamerItemField[] = [];

	for (const fieldName in additions) {
		// convert lucid field name to codebeamer api field name
		let codebeamerFieldName = '';
		switch (fieldName) {
			case DefaultFieldNames.Name:
				codebeamerFieldName = 'name';
				break;
			case DefaultFieldNames.Description:
				codebeamerFieldName = 'description';
				break;
			case DefaultFieldNames.StoryPoints:
				codebeamerFieldName = 'storyPoints';
				break;
			case DefaultFieldNames.Assignee:
				codebeamerFieldName = 'assignedTo';
				break;
			case DefaultFieldNames.Team:
				codebeamerFieldName = 'teams';
				break;
			case DefaultFieldNames.Status:
				codebeamerFieldName = 'status';
				break;
			case DefaultFieldNames.Version:
				codebeamerFieldName = 'version';
				break;
			case DefaultFieldNames.Owner:
				codebeamerFieldName = 'owners';
				break;
		}

		const field = editableItemFields.find(
			(field) => field.name === codebeamerFieldName
		);
		if (field && field.type !== 'ChoiceFieldValue') {
			fieldValues.push({
				fieldId: field.fieldId,
				type: field.type,
				name: field.name,
				value: additions[fieldName],
			});
		} else if (field && field.type === 'ChoiceFieldValue') {
			if (
				codebeamerFieldName === 'assignedTo' ||
				codebeamerFieldName === 'teams' ||
				codebeamerFieldName === 'owners'
			) {
				// comments and variables were written for assignedTo but it will work for teams and owners as well

				const fieldValueType =
					codebeamerFieldName === 'assignedTo' ||
					codebeamerFieldName === 'owners'
						? 'UserReference'
						: 'TrackerItemReference';
				// replace first index of assignedTo array with the new assignee
				const assigneeId = additions[fieldName] as number;
				const user =
					codebeamerFieldName === 'assignedTo'
						? await codebeamerClient.getUserById(assigneeId)
						: await codebeamerClient.getItem(assigneeId);
				let usersAssignedToItem = field.values;

				// if there are assigned users then replace the first one
				if (usersAssignedToItem?.length && usersAssignedToItem.length > 0) {
					// check if the user is already assigned to the item
					const userAlreadyAssigned = usersAssignedToItem.some(
						(user) => user.id === assigneeId
					);
					// if user is already assigened, move it to the first index
					if (userAlreadyAssigned) {
						// remove first index
						usersAssignedToItem.shift();
						// if there are still users assigned, add the user to the first index
						if (usersAssignedToItem.length > 1) {
							// remove the user from the array
							usersAssignedToItem = usersAssignedToItem.filter(
								(user) => user.id !== assigneeId
							);
							// add the user to the first index
							usersAssignedToItem.unshift({
								id: user.id,
								name: user.name,
								type: fieldValueType,
							});
						} else {
							// if there are no users assigned, add the user to the first index
							usersAssignedToItem.unshift({
								id: user.id,
								name: user.name,
								type: fieldValueType,
							});
						}
					} else {
						// if user is not already assigned, replace the first user with the new user
						user
							? (usersAssignedToItem[0] = {
									id: user.id,
									name: user.name,
									type: fieldValueType,
							  })
							: // assignee has been removed from card
							  usersAssignedToItem.splice(0, 1);
					}
				} else {
					// no users assigned, create a new array with the new user
					usersAssignedToItem = user
						? [{ id: user.id, name: user.name, type: fieldValueType }]
						: [];
				}
				// add assignee to fieldValues which will be used to update the item
				fieldValues.push({
					fieldId: field.fieldId,
					type: field.type,
					name: field.name,
					values: usersAssignedToItem,
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
