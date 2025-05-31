// VideoPlayer.jsx
import React from 'react';
import ApiVideoPlayer from "@api.video/react-player";

import "./VideoPlayer.css";
const VideoPlayer = ({
                         videoId = "viWMWB4veOUnJqHqRUNCXQV",
                         height = "568px",
                         width = "320px",
                         metadata = {}
}) => {
    return (
        <>
            <div className="video-player mb-5" key={`vContainer_${videoId}`}>
                <ApiVideoPlayer
                    video={{ id: videoId }}
                    style={{ height, width }}
                    metadata={{ metadata }}
                />;
            </div>
        </>
    );
};

export default VideoPlayer;