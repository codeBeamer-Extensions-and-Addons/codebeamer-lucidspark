<<<<<<< Updated upstream
import { isNumber, isString } from 'lucid-extension-sdk/core/checks';
=======
import { isNumber } from 'lucid-extension-sdk/core/checks';
>>>>>>> Stashed changes
import {
	arrayValidator,
	objectValidator,
} from 'lucid-extension-sdk/core/validators/validators';

export const importBodyValidator = objectValidator({
	itemIds: arrayValidator(isNumber),
<<<<<<< Updated upstream
	trackerId: isString,
=======
	trackerId: isNumber,
>>>>>>> Stashed changes
});
