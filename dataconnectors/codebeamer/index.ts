import { DataConnector, DataConnectorClient } from 'lucid-extension-sdk';
import { DataAction } from '../../common/names';
import { importAction } from './actions/importaction';
<<<<<<< Updated upstream

export const makeDataConnector = (client: DataConnectorClient) =>
	new DataConnector(client).defineAsynchronousAction(
		DataAction.Import,
		importAction
	);
=======
import { hardRefreshAction } from './actions/hardrefreshaction';
import { patchAction } from './actions/patchaction';

export const makeDataConnector = (client: DataConnectorClient) =>
	new DataConnector(client)
		.defineAsynchronousAction(DataAction.Import, importAction)
		.defineAsynchronousAction(DataAction.HardRefresh, hardRefreshAction)
		.defineAction(DataAction.Patch, patchAction);
>>>>>>> Stashed changes
