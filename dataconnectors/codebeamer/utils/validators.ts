import { isNumber } from 'lucid-extension-sdk/core/checks';
import {
	arrayValidator,
	objectValidator,
} from 'lucid-extension-sdk/core/validators/validators';

/**
 * Validator for the body of the import action
 */
export const importBodyValidator = objectValidator({
	itemIds: arrayValidator(isNumber),
	projectId: isNumber,
	trackerId: isNumber,
});
