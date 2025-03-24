import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {NavBar} from "./components/NavBar/NavBar";
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CursorRadius from "./components/shared/RadialCursor/RadialCursor";

function App() {
    const
        [isHovering, setIsHovering] = useState(false),
        [currentView, setCurrentView] = useState("All Items");

    const changeViewTo = (requestedView) => {
        setCurrentView(requestedView);
    };

    return (
        <div className="App">
            <header className="App-header">
                <NavBar onViewChange={changeViewTo} setIsHovering={setIsHovering} />
            </header>
            <main>
                <ToastContainer/>
                <Outlet context={{ currentView, setIsHovering }} />
            </main>
            <CursorRadius isHovering={isHovering} />
        </div>
    );
}

export default App;
