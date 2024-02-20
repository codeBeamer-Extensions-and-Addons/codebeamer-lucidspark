import { isNumber, isString } from 'lucid-extension-sdk/core/checks';
import {
	arrayValidator,
	objectValidator,
} from 'lucid-extension-sdk/core/validators/validators';

export const importBodyValidator = objectValidator({
	itemIds: arrayValidator(isNumber),
	trackerId: isString,
});
