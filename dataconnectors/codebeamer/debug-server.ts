import * as crypto from 'crypto';
import * as express from 'express';
import { DataConnectorClient } from 'lucid-extension-sdk';
import { makeDataConnector } from './index';

const dataConnector = makeDataConnector(
	new DataConnectorClient({ crypto, Buffer })
);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dataConnector.runDebugServer({ express });
