import {
	EditorClient,
	LucidCardIntegrationRegistry,
	Menu,
	MenuType,
	PageProxy,
} from 'lucid-extension-sdk';
import { CodeBeamerCardIntegration } from './codebeamercardintegration';
const client = new EditorClient();

function createProcessBlock(page: PageProxy, x: number, y: number) {
	const block = page.addBlock({
		className: 'ProcessBlock',
		boundingBox: {
			x,
			y,
			w: 200,
			h: 160,
		},
	});
	block.textAreas.set('Text', 'The new shape');
}

async function init() {
	await client.loadBlockClasses(['ProcessBlock']);

	const menu = new Menu(client);
	menu.addMenuItem({
		label: 'Test thing 2',
		action: 'test',
		menuType: MenuType.Main,
	});

	// create a block
	const page = new PageProxy('test', client);
	createProcessBlock(page, 0, 0);
}

init();

LucidCardIntegrationRegistry.addCardIntegration(
	client,
	new CodeBeamerCardIntegration(client)
);

// import {EditorClient, Menu, MenuType, Viewport} from 'lucid-extension-sdk';
// import {ImportModal} from './importmodal';

// const client = new EditorClient();
// const menu = new Menu(client);
// const viewport = new Viewport(client);

// client.registerAction('test', () => {
//     const modal = new ImportModal(client);
//     modal.show();
// });

// menu.addMenuItem({
//     label: 'Test thing 2',
//     action: 'test',
//     menuType: MenuType.Main,
// });
