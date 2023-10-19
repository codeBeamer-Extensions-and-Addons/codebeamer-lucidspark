import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Content from './pages/content/Content';
import Toasts from './components/toasts/Toasts';
import BoardSettingsLoader from './components/boardSettingsLoader/BoardSettingsLoader';

function App() {
	return (
		<Provider store={store}>
			<BoardSettingsLoader>
				<Content />
			</BoardSettingsLoader>
			<Toasts />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
