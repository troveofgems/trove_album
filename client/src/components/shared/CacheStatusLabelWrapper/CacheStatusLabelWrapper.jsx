import React, {useEffect} from 'react';

import {
    showAllResourcesLoadedMessage,
    showErrorMessage, showLoadingResourcesMessage,
    showNoResourcesLoadedMessage
} from "../../Album/LoadMessages/LoadMessages";

import "./CacheStatusLabelWrapper.css";
export const CacheStatusLabelWrapper = ({ data, error, isLoading, isFetching, cacheItem }) => {
    const
        renderMessage = (ipd, type) => {
            if(type === "rcs" && cacheItem === "Photos" && !!ipd && !!ipd.pages) {
                return (ipd.pages[ipd.pages.length - 1].fromCache === true) ?
                    (
                        <span className={"text-success cacheOn"}>ON</span>
                    ) : (
                        <span className={"text-danger cacheOff"}>OFF</span>
                    )
            } else if (type === "rtc" && cacheItem === "Photos" && !!ipd && !!ipd.pages) {
                return ipd?.pages.length > 0 ? (
                        <span className={"text-success cacheOn"}>ON</span>
                    ) : (
                        <span className={"text-danger cacheOff"}>OFF</span>
                    )
            } else {
                return <span className={"text-danger cacheOff"}>OFF</span>;
            }
        }

    return (
        <div className={"text-white mt-5 mb-5 button-85 cacheWindow"}>
            <div className={"rcsMessage p-0 text-log"}>
                <div className={"d-flex row"}>
                    <div className={"col-5 text-center"}>
                        <p>
                            RCS:
                            <span className={"flex-column"}>
                        {
                            !!data &&
                            renderMessage(data, "rcs")
                        }
                    </span>
                            <br/>
                            <small>Redis Cache Service</small>
                        </p>
                    </div>
                    <div className={"col-2 cacheDivider"}>
                        <div className="d-flex flex-shrink">
                            <div className="vr"></div>
                        </div>
                    </div>
                    <div className={"col-5 text-center"}>
                        <p>
                            RTC:
                            <span className={"flex-column"}>
                            {
                                !!data &&
                                renderMessage(data, "rtc")
                            }
                            </span>
                            <br/>
                            <small>Redux Toolkit Cache</small>
                        </p>
                    </div>
                    <hr/>
                    <div className={"col-12"}>
                        {
                            showNoResourcesLoadedMessage(data)
                        }
                        {
                            !!data ?
                                showAllResourcesLoadedMessage(data) :
                                showErrorMessage(error)
                        }
                        {
                            (isLoading || isFetching) &&
                            showLoadingResourcesMessage()
                        }
                    </div>
                </div>
            </div>
        </div>
    )
};