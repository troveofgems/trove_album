import React, {useState} from "react";
import {useAddVideoMutation} from "../../../redux/slices/video.api.slice";
import {useDispatch} from "react-redux";
import {FormContainer} from "../../../components/shared/FormContainer/FormContainer";
import Form from "react-bootstrap/Form";
import {Button, Col, InputGroup, Row} from "react-bootstrap";
import {TagField} from "../../../components/shared/TagField/TagField";
import useTags from "../../../hooks/useTag.hook";
import VideoPlayer from "../../../components/shared/VideoPlayer/VideoPlayer";

export const AddVideoScreen = () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoTitle, setVideoTitle] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [makePublic, setMakePublic] = useState(false);
    const [isPanoramic, setIsPanoramic] = useState(false);
    const [transcriptAvailable, setTranscriptAvailable] = useState(false);
    const [addTranscriptTags, setAddTranscriptTags] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState(new FormData());

    const [addVideo, isLoading] = useAddVideoMutation();
    const dispatch = useDispatch();

    const // Tag Field Controllers
        {
            tags: videoTags,
            handleAddTag: handleAddVideoTag,
            handleRemoveTag: handleRemoveVideoTag
        } = useTags(5),
        {
            tags: transcriptTags,
            handleAddTag: handleAddTranscriptTag,
            handleRemoveTag: handleRemoveTranscriptTag
        } = useTags(5);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('video', file);
        setFormData(formData);
    };

    const handleFormSubmit = async (evt) => {
        evt.preventDefault();
        try {
            formData.append("title", videoTitle);
            formData.append("description", videoDescription);
            formData.append("public", makePublic);
            formData.append("panoramic", isPanoramic);
            formData.append("mp4Support", true);
            formData.append("transcript", transcriptAvailable);
            formData.append("transcriptSummaryAttributes", transcriptTags);
            formData.append("tags", videoTags);
            let response = await addVideo({
                formData: formData,
                dispatch: dispatch,
                setUploadProgress: setUploadProgress
            }).unwrap();
            console.log('Upload successful:', response.data);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleChangeSwitchState = (evt, changeFor) => {
        switch(changeFor) {
            case "transcriptAvailable":
                setTranscriptAvailable(!transcriptAvailable);
                break;
            case "addTranscriptAttributes":
                setAddTranscriptTags(!addTranscriptTags);
                break;
            case "makePublic":
                setMakePublic(!makePublic);
                break;
            case "panoramic":
                setIsPanoramic(!isPanoramic);
                break;
            default:
                return false;
        }
    };

    return (
        <FormContainer className={"my-5"}>
            <h2 className={"text-center text-white my-5"}>Add A Video</h2>
            <Form onSubmit={(evt) => handleFormSubmit(evt)}>
                <Row>
                    <Col xs={12} md={4} lg={4}>
                        <Form.Group controlid={"videoUpload"} className={"button-85"}>
                            <Form.Label column={true} className={"text-white"}>Upload Video</Form.Label>
                            <Form.Control
                                type="file"
                                accept="video/*"
                                placeholder={"Image"}
                                onChange={handleFileChange}
                                className={"button-85"}
                                disabled={isUploading}
                            >
                            </Form.Control>
                            {isUploading && (
                                <div className="upload-progress text-white">
                                    Uploading: {uploadProgress}%
                                </div>
                            )}
                        </Form.Group>
                        <div className={"mt-5"}>
                            <VideoPlayer />
                        </div>
                    </Col>
                    <Col xs={12} md={8} lg={6}>
                        <Row>
                            <Col xs={12} md={8} lg={8}>
                                <Form.Group controlid={"title"} className={"mb-3 text-start"}>
                                    <Form.Label column={true} className={"text-white"}>Video Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={"Video Title"}
                                        onChange={(e) => setVideoTitle(e.target.value)}
                                    >
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlid={"description"} className={"mb-5"}>
                                    <InputGroup>
                                        <InputGroup.Text>Video Description</InputGroup.Text>
                                        <Form.Control as="textarea" aria-label="Description"
                                                      onChange={(e) => setVideoDescription(e.target.value)}/>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={4} lg={4}>
                                <Form.Group controlid={"Video Options"} className={"mb-5"}>
                                    <h5 className={"text-start text-white"}>Video Options</h5>
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="publish-switch"
                                        label="Make Video Public"
                                        className={"text-white"}
                                        defaultChecked={true}
                                        onChange={(evt) => handleChangeSwitchState(evt, "makePublic")}
                                    />
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="panoramic-switch"
                                        label="Panoramic Video"
                                        className={"text-white"}
                                        onChange={(evt) => handleChangeSwitchState(evt, "panoramic")}
                                    />
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="mp4Support-switch"
                                        label="MP4 Video Support"
                                        className={"text-white"}
                                        defaultChecked={true}
                                        disabled={true}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12} md={8} lg={8}>
                                <Form.Group controlid={"Video Tags"} className={"mb-5"}>
                                    <InputGroup>
                                        <InputGroup.Text>Video Tags</InputGroup.Text>
                                        <TagField
                                            aria-label="Video Tags"
                                            tags={videoTags}
                                            addTag={handleAddVideoTag}
                                            removeTag={handleRemoveVideoTag}
                                            maxTags={`${5}`}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                {
                                    addTranscriptTags && (
                                        <Form.Group controlid={"Transcript Tags"} className={"mb-5"}>
                                            <InputGroup>
                                                <InputGroup.Text>Transcript Tags</InputGroup.Text>
                                                <TagField
                                                    aria-label="Transcript Tags"
                                                    tags={transcriptTags}
                                                    addTag={handleAddTranscriptTag}
                                                    removeTag={handleRemoveTranscriptTag}
                                                    maxTags={`${5}`}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    )
                                }
                            </Col>
                            <Col xs={12} md={4} lg={4}>
                                <Form.Group controlid={"Video Transcriptions"} className={"mb-5"}>
                                    <h5 className={"text-start text-white"}>Transcript Options</h5>
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="transcript-available-switch"
                                        label="Transcript Available"
                                        className={"text-white"}
                                        onChange={(evt) => handleChangeSwitchState(evt, "transcriptAvailable")}
                                    />
                                    <Form.Check // prettier-ignore
                                        type="switch"
                                        id="addTranscriptAttributeTags-switch"
                                        label="Add Transcript Tags"
                                        className={"text-white"}
                                        onChange={(evt) => handleChangeSwitchState(evt, "addTranscriptAttributes")}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={2}>
                        <Button variant={"primary"} className={"mt-3 mb-5 button-85"} type={"submit"} disabled={(videoTags.length === 0)}>
                            Process Video
                        </Button>
                    </Col>
                </Row>
            </Form>
        </FormContainer>
    )
}