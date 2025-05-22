import React from "react";
import {GalleryView} from "../../components/Gallery/View/GalleryView";
import {useLocation, useOutletContext} from "react-router-dom";

export const HomeScreen = () => {
    const
        { state: queryState } = useLocation(),
        { currentView } = useOutletContext();

    return <GalleryView
        viewingGallery={currentView}
        filters={queryState}
    />;
}