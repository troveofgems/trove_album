import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import {NavBar} from "./components/NavBar/NavBar";
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";

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
            <Outlet context={{ currentView }}/>
        </main>
        <ToastContainer />
    </div>
  );
}

export default App;
