import React, {useEffect, useState} from 'react';
import {useFetchVideosQuery} from "../../../redux/slices/video.api.slice";
import {CacheStatusLabelWrapper} from "../../shared/CacheStatusLabelWrapper/CacheStatusLabelWrapper";
import VideoPlayer from "../../shared/VideoPlayer/VideoPlayer";
import {Col, Row} from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export const VideoGallery = ({  }) => {
    const
        [videoId, setVideoId] = useState(""),
        [height, setHeight] = useState("250px"),
        [width, setWidth] = useState("250px"),
        [metadata, setMetadata] = useState([]);

    const {
        data: results,
        error,
        isLoading, isFetching
    } = useFetchVideosQuery();

    useEffect(() => {
        if(!!results && results.data.videoList.length > 0) {
            setVideoId(results.data.videoList[0].provider.videoId);
            setHeight(results.data.videoList[0].height);
            setWidth(results.data.videoList[0].width);
            setMetadata(results.data.videoList[0].provider.metadata);
        }
    }, [results]);

    const handleUpdateVideoPlayer = (video) => {
        setVideoId(video.provider.videoId);
        setHeight(video.height);
        setWidth(video.width);
        setMetadata(video.provider.metadata);
    }

    return (
        <div>
            <div id={"galleryBanner"} className={"d-flex"}>
                <h2 className={"text-white mt-5 mb-5"}>
                    Video Gallery
                </h2>
                {
                    !!results &&
                    !!results.data &&
                    !!results.data.videoList &&
                    <CacheStatusLabelWrapper
                        data={results.data.videoList}
                        error={error}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        cacheItems={"Videos"}
                    />
                }
            </div>
            {
                !!results &&
                !!results.data &&
                !!results.data.videoList && (
                    <>
                        {
                            videoId.length > 0 && (
                                <VideoPlayer
                                    videoId={videoId}
                                    height={height}
                                    width={width}
                                    metadata={metadata}
                                />
                            )
                        }
                        <Row className={"mb-5 pb-5"}>
                            {
                                results.data.videoList.map((video, index) => (
                                    <Col lg={3} md={2} sm={12} key={`${index}_${video.videoId}`}>
                                        <Card style={{ width: '18rem' }}>
                                            <Card.Img variant="top" src={video.provider.assets.thumbnail} />
                                            <Card.Body>
                                                <Card.Title>{video.title}</Card.Title>
                                                <Card.Text>
                                                    {video.description}
                                                </Card.Text>
                                                <Button
                                                    variant="button-85"
                                                    onClick={() => handleUpdateVideoPlayer(video)}
                                                >Load Video Into Player</Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            }
                        </Row>
                    </>
                )
            }
        </div>
    )
};