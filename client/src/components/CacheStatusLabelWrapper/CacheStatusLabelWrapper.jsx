import React, {useEffect, useState} from 'react';

import {
    showAllResourcesLoadedMessage,
    showErrorMessage, showLoadingResourcesMessage,
    showNoResourcesLoadedMessage
} from "../Album/LoadMessages/LoadMessages";

import "./CacheStatusLabelWrapper.css";
export const CacheStatusLabelWrapper = ({ infinitePhotoData, error, isLoading, isFetching }) => {
    const
        renderMessage = (ipd, type) => {
            console.log("Render Message: ", ipd, type);
            if(type === "rcs" && !!ipd) {
                console.log("Inside Type: RCS")
                return (ipd?.pages[ipd?.pages?.length - 1].fromCache === true) ?
                    (
                        <span className={"text-success cacheOn"}>ON</span>
                    ) : (
                        <span className={"text-danger cacheOff"}>OFF</span>
                    )
            } else if (type === "rtc" && !!ipd) {
                console.log("Inside Type: RTC")
                return ipd?.pages.length > 0 ? (
                        <span className={"text-success cacheOn"}>ON</span>
                    ) : (
                        <span className={"text-danger cacheOff"}>OFF</span>
                    )
            }
        }

    useEffect(() => {
        console.log("Fix ", infinitePhotoData);
        let test = !!infinitePhotoData;
        console.log("IPD Exists? ", test);
    }, [infinitePhotoData]);

    console.log("infinitePhotoData from cache wrapper? ", infinitePhotoData);
    return (
        <div className={"text-white mt-5 mb-5 button-85 cacheWindow"}>
            <div className={"rcsMessage p-0 text-log"}>
                <div className={"d-flex row"}>
                    <div className={"col-5 text-center"}>
                        <p>
                            RCS:
                            <span className={"flex-column"}>
                        {
                            !!infinitePhotoData &&
                            renderMessage(infinitePhotoData, "rcs")
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
                                !!infinitePhotoData &&
                                renderMessage(infinitePhotoData, "rtc")
                            }
                            </span>
                            <br/>
                            <small>Redux Toolkit Cache</small>
                        </p>
                    </div>
                    <hr/>
                    <div className={"col-12"}>
                        {
                            showNoResourcesLoadedMessage(infinitePhotoData)
                        }
                        {
                            !!infinitePhotoData ?
                                showAllResourcesLoadedMessage(infinitePhotoData) :
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