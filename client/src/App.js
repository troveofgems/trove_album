import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {NavBar} from "./components/NavBar/NavBar";
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";

function App() {
    const [currentView, setCurrentView] = useState("All Items");

    const changeViewTo = (requestedView) => {
        setCurrentView(requestedView);
    }

    return (
        <div className="App">
            <header className="App-header">
                <NavBar onViewChange={changeViewTo}/>
            </header>
            <main>
                <ToastContainer/>
                <Outlet context={{currentView}}/>
            </main>
        </div>
    );
}

export default App;
