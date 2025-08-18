import { CodeBeamerItemField } from '../../../common/models/api-query-types';
import { CodeBeamerItem } from '../../../common/models/codebeamer-item.if';
import { DefaultFieldNames } from '../../../common/names';
import { CodebeamerClient } from '../net/codebeamerclient';

/**
 * Updates a codebeamer item with the given fields
 * @param itemId id of the item to update
 * @param additions fields of item to be updated
 * @param oAuthToken OAuth token for authentication
 * @returns
 */
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
		const field = editableItemFields.find(
			(field) => field.name === fieldName
		);
		if (
			field &&
			(field.type == 'IntegerFieldValue' || field.type == 'TextFieldValue')
		) {
			fieldValues.push({
				fieldId: field.fieldId,
				type: field.type,
				name: field.name,
				value: additions[fieldName],
			});
		} else if (field && field.type === 'ChoiceFieldValue') {
			if (
				fieldName === DefaultFieldNames.AssignedTo ||
				fieldName === DefaultFieldNames.Team ||
				fieldName === DefaultFieldNames.Owner
			) {
				// comments and variables were written for assignedTo but it will work for teams and owners as well

				const fieldValueType =
					fieldName === DefaultFieldNames.AssignedTo ||
					fieldName === DefaultFieldNames.Owner
						? 'UserReference'
						: 'TrackerItemReference';
				// replace first index of assignedTo array with the new assignee
				const assigneeId = additions[fieldName] as number;
				const user =
					fieldName === DefaultFieldNames.AssignedTo
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
