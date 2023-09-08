import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

interface IFrameMessage {
	type: string;
	data: any;
}

function App() {

  useEffect(() => {
    console.log("App initialized");

    window.parent.postMessage({ type: 'ready' }, '*');
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
