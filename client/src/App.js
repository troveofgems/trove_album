import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {GalleryView} from "./components/Gallery/View/GalleryView";
import {NavBar} from "./components/NavBar/NavBar";

function App() {
  const [currentView, setCurrentView] = useState("Pets");

  const changeViewTo = (requestedView) => {
      setCurrentView(requestedView);
  }

  return (
    <div className="App">
        <header className="App-header">
            <NavBar onViewChange={changeViewTo} />
        </header>
        <main>
            <GalleryView currentView={currentView} />
        </main>
        {/*<footer>
            Footer
        </footer>*/}
    </div>
  );
}

export default App;
