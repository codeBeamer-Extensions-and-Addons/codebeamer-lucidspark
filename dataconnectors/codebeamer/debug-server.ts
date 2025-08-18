import * as crypto from 'crypto';
import * as express from 'express';
import { DataConnectorClient } from 'lucid-extension-sdk';
import { makeDataConnector } from './index';

const app = express();
const dataConnector = makeDataConnector(
	new DataConnectorClient({ crypto, Buffer })
);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dataConnector.runDebugServer({ express, app });
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Express server listening on port ${PORT}`);
});
