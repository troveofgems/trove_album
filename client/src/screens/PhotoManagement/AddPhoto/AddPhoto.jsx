import React, {useEffect, useRef, useState} from 'react';
import {Button, Form, Row, Col, Image, InputGroup} from "react-bootstrap";
import {FormContainer} from "../../../components/shared/FormContainer/FormContainer";
import {TagField} from "../../../components/shared/TagField/TagField";
import useTags from "../../../hooks/useTag.hook";
import {useAddPhotoMutation} from "../../../redux/slices/gallery.api.slice";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";


export const AddPhoto = () => {
    const MAX_TAGS = 5;

    const [addPhoto, isLoading] = useAddPhotoMutation();

    const [photoTitle, setPhotoTitle] = useState("");
    const [customDownloadName, setCustomDownloadName] = useState("");
    const [photoDescription, setPhotoDescription] = useState("");
    const [photoAltText, setPhotoAltText] = useState("");
    const { tags, handleAddTag, handleRemoveTag } = useTags(MAX_TAGS);

    const [picture, setPicture] = useState(null);
    const [imgData, setImgData] = useState(null);
    const [dimensions, setDimensions] = useState({ height: 0, width: 0, fileSizeInKB: 0, fileSizeInMB: 0 });
    const imgRef = useRef(null);

    const navigate = useNavigate();

    const onUploadImage = e => {
        if (e.target.files[0]) {
            setPicture(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImgData(reader.result);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    useEffect(() => {
        if(imgRef.current) {
            setDimensions({
                height: imgRef.current.naturalHeight,
                width: imgRef.current.naturalWidth,
                fileSizeInKB: picture ? (picture?.size * 0.001) : 0,
                fileSizeInMB: picture ? (picture?.size * 0.000001) : 0
            });
        }
    }, [imgRef, imgData]);

    const handlePushPhotoToServer = async (e) => {
        e.preventDefault();
        let photo = {
            src: imgData,
            alt: photoAltText,
            width: dimensions.width,
            height: dimensions.height,
            captions: {
                title: photoTitle,
                description: photoDescription
            },
            download: {
                filename: customDownloadName
            },
            tags
        }

        try {
            const res = await addPhoto(photo).unwrap();
            console.log("Res was: ", res);
            toast.success(res.message);
            return navigate("/admin/photo-management");
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            return toast.error(err?.data?.message || err.error || err.status);
        }
    };

    return (
        <FormContainer>
            <h1>Add A Photo</h1>
            <Form onSubmit={handlePushPhotoToServer} className={"mb-5"}>
                <Row>
                    <Col xs={12} md={6}>
                        <Form.Group controlid={"imageUpload"}>
                            <Form.Label column={true}>Upload Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                placeholder={"Image"}
                                onChange={onUploadImage}
                            >
                            </Form.Control>
                        </Form.Group>
                        {
                            !!picture && (
                                <div className={"mt-3 mb-3"}>
                                    <Image ref={imgRef} src={`${imgData}`} thumbnail />
                                    <Row className={"text-start"}>
                                        <Col>
                                            <p className={"pt-2 pb-0 mb-0"}>Natural Height: {dimensions.height}px</p>
                                            <p className={"pb-0 mb-0"}>Natural Width: {dimensions.width}px</p>
                                            <p className={"pb-0 mb-0"}>
                                                File Size (KB): {dimensions.fileSizeInKB.toFixed(3)}
                                            </p>
                                            <p className={"pb-0 mb-0"}>
                                                File Size (MB): {dimensions.fileSizeInMB.toFixed(3)}
                                            </p>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        }
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group controlid={"title"} className={"mb-3"}>
                            <Form.Label column={true}>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={"Photo Title"}
                                onChange={(e) => setPhotoTitle(e.target.value)}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlid={"description"} className={"mb-5"}>
                            <Form.Label column={true}>Custom Download Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={"Custom Download Name"}
                                onChange={(e) => setCustomDownloadName(e.target.value)}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlid={"alt"} className={"mb-5"}>
                            <InputGroup>
                                <InputGroup.Text>Alt Text</InputGroup.Text>
                                <Form.Control as="textarea" aria-label="Alt Text" onChange={(e) => setPhotoAltText(e.target.value)} />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlid={"description"} className={"mb-5"}>
                            <InputGroup>
                                <InputGroup.Text>Description</InputGroup.Text>
                                <Form.Control as="textarea" aria-label="Description" onChange={(e) => setPhotoDescription(e.target.value)} />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlid={"Photo Tags"} className={"mb-5"}>
                            <InputGroup>
                                <InputGroup.Text>Photo Tags</InputGroup.Text>
                                <TagField
                                    tags={tags}
                                    addTag={handleAddTag}
                                    removeTag={handleRemoveTag}
                                    maxTags={MAX_TAGS}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
                <Button variant={"primary"} className={"mt-2 mb-5"} type={"submit"}>
                    Process Photo
                </Button>
            </Form>
        </FormContainer>
    );
}