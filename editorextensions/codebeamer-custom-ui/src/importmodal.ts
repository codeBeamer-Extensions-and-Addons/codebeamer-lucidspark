import {EditorClient, Modal} from 'lucid-extension-sdk';

export interface ImportModalMessage {
    'name': string;
    'content': string;
}

export class ImportModal extends Modal {
    constructor(client: EditorClient) {
        super(client, {
            title: 'codebeamer-cards import',
            width: 1080,
            height: 680,
            url: 'modal/index.html'
        });
    }

    protected frameLoaded() {
        this.sendMessage({'message': 'Successfully passed message to iframe'});
    }

    protected messageFromFrame(message: ImportModalMessage): void {
        console.log(message['name']);
        console.log(message['content']);

        this.hide();
    }
}
