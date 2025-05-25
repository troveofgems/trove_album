import React from "react";
import {Loader} from "../../shared/Loader/Loader";
import {UNKNOWN_ERROR} from "../../../constants/frontend.constants";

// Exportable Functions
export const handleResourceMessages = (response) => {
    if(!!response?.pages) {
        const {
            fetchQuotaReached = false,
            imageList = [],
        } = response?.pages[response?.pages.length - 1].data.photos;
        return {
            allResourcesLoaded: (fetchQuotaReached   && imageList.length >   0) || false,
            noResourcesLoaded:  (fetchQuotaReached   && imageList.length === 0) || false,
            someItemsLoaded:    (!fetchQuotaReached  && imageList.length >   0) || false
        };
    }
};

export const showAllResourcesLoadedMessage = (status = {
    allResourcesLoaded: false,
    noResourcesLoaded: false,
    someItemsLoaded: false
}) => (
    <>
        {
            showMessage(handleResourceMessages(status), 'allResourcesLoaded') &&
            AllResourcesLoaded()
        }
    </>
);

export const showNoResourcesLoadedMessage = (status= {
    allResourcesLoaded: false,
    noResourcesLoaded: false,
    someItemsLoaded: false
}) => (
    <>
        {
            showMessage(handleResourceMessages(status), 'noResourcesLoaded') &&
            NoResourcesAvailable()
        }
    </>
);

export const showErrorMessage = (error = null) => {
    //console.error("Fine-tune Error Message Handling...", error);
    if (error === null) {
        return null;
    }
    return (
        <div className={"text-center"}><small>{error?.data?.message || error?.error || UNKNOWN_ERROR}</small></div>
    )
}

// Internal Helper Functions
const showMessage = (status, name) => (!!status && !!status[name] && status[name]) || false;

const AllResourcesLoaded = () => <div className={"text-center"}><small>All Resources Have Been Loaded! ☺️</small></div>;

const NoResourcesAvailable = () => <div className={"text-center"}><small>No Resources Currently Uploaded 😭</small></div>;

export const showLoadingResourcesMessage = () => <div className={"text-center"}><small>Loading...</small></div>;