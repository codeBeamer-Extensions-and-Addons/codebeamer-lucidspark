import { DataConnector, DataConnectorClient } from 'lucid-extension-sdk';
import { importAction } from './actions/import';
import { DataAction } from '../../common/names';

export const makeDataConnector = (client: DataConnectorClient) =>
	new DataConnector(client).defineAsynchronousAction(
		DataAction.Import,
		importAction
	);
