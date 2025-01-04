import React from "react";
import {GalleryView} from "../../components/Gallery/View/GalleryView";
import {useOutletContext} from "react-router-dom";

export const HomeScreen = () => {
    const { currentView } = useOutletContext();
    return (
        <>
            <GalleryView currentView={currentView} />
        </>
    )
}