import React from "react";
import {Album} from "../../components/Album/Album";
import {useLocation, useOutletContext} from "react-router-dom";

export const HomeScreen = () => {
    const
        { state: queryState } = useLocation(),
        { currentView } = useOutletContext();

    return <Album
        viewingGallery={currentView}
        filters={queryState}
    />;
}