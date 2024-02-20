import { DataConnector, DataConnectorClient } from 'lucid-extension-sdk';
import { DataAction } from '../../common/names';
import { importAction } from './actions/importaction';

export const makeDataConnector = (client: DataConnectorClient) =>
	new DataConnector(client).defineAsynchronousAction(
		DataAction.Import,
		importAction
	);
