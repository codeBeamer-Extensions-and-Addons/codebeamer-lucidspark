import {
	EditorClient,
	Panel,
	PanelLocation,
	Viewport,
} from 'lucid-extension-sdk';

const client = new EditorClient();

export class RightPanel extends Panel {
	private static icon = 'https://lucid.app/favicon.ico';

	constructor(client: EditorClient) {
		super(client, {
			title: 'From React',
			url: 'rightpanel/index.html',
			location: PanelLocation.RightDock,
			iconUrl: RightPanel.icon,
		});
	}
}

const rightPanel = new RightPanel(client);
