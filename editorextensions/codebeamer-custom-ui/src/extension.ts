import {
	EditorClient,
	LucidCardIntegrationRegistry,
} from 'lucid-extension-sdk';
import { CodebeamerCardIntegration } from './codebeamercardintegration';

const client = new EditorClient();
const codebeamerCardIntegration = new CodebeamerCardIntegration(client);
LucidCardIntegrationRegistry.addCardIntegration(
	client,
	codebeamerCardIntegration
);

console.log('codebeamer-cards extension loaded @v1.2-alpha.1');
