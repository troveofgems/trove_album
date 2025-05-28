import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import {Button, Col, InputGroup, Row, Image} from "react-bootstrap";
import {toast} from "react-toastify";

import {
    useFetchPhotoByIdQuery,
    useUpdatePhotoMutation,
    useUpdatePhotoWithPatchMutation,
} from "../../../redux/slices/gallery.api.slice";
import {TagField} from "../../../components/shared/TagField/TagField";
import {constructPhotoUpdateTemplate} from "../../../utils/photo.utils";
import useTags from "../../../hooks/useTag.hook";

export const UpdatePhoto = () => {
    const
        navigate = useNavigate(),
        [makePatchCall, setMakePatchCall] = useState(false),
        [photoTitle, setPhotoTitle] = useState(""),
        [photoDescription, setPhotoDescription] = useState(""),
        [customDownloadName, setCustomDownloadName] = useState(""),
        [photoAltText, setPhotoAltText] = useState("");

    const [updatePhoto, isLoadingUpdatePhoto] = useUpdatePhotoMutation();
    const [updatePhotoWithPatch, isLoadingUpdatePatch] = useUpdatePhotoWithPatchMutation();

    const { tags, handleAddTag, handleRemoveTag } = useTags(5);

    const // Component Actions
        location = useLocation(),
        splitLocation = location.pathname.split("/"),
        splitLength = splitLocation.length,
        {
            data: photo,
            isLoading: isLoadingPhotoData,
            error: photoFetchError
        } = useFetchPhotoByIdQuery({ photoId: splitLocation[splitLength - 1] });

    useEffect(() => {
        if(!!photo) {
            setPhotoTitle(photo.data.captions.title);
            setCustomDownloadName(photo.data.download.filename);
            setPhotoAltText(photo.data.captions.alt);
            setPhotoDescription(photo.data.captions.description);
            if(photo.data.tags.length > 0 && tags.length === 0) {
                photo.data.tags.forEach(tag => tags.push(tag));
            }
        }
    }, [photo]);

    const setUserJSX = (user) => {
        let
            userLabels = ["Name: ", "ID: ", "Email: ", "User Type: "],
            userValues = [
                `${user.firstName} ${user.lastName}`,
                `${user._id}`,
                `${user.email}`,
                `${user.isAdmin === true ? "Admin" : "False"}`
            ],
            jsx = [];

        for(let i = 0; i < 4; i += 1) {
            jsx.push(
                <Row className={"text-white"}>
                    <Col lg={3} sm={12} key={`${i}_ud_l_${userLabels[i]}`} className={"text-secondary"}>
                        {userLabels[i]}
                    </Col>
                    <Col lg={6} key={`${i}_ud_v_${userLabels[i]}`}>
                        {userValues[i]}
                    </Col>
                </Row>
            );
        }

        return jsx;
    };
    const setEXIFDataJSX = (photo) => {
        let jsx = [];
        // Photo Id
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoIdLabel`}>
                    Photo Id:
                </Col>
                <Col lg={6} key={`photoIdValue`}>
                    {photo._id}
                </Col>
            </Row>
        );

        // Photo Created At
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoCreatedAtLabel`}>
                    Uploaded on:
                </Col>
                <Col lg={6} key={`photoCreatedAtValue`}>
                    {photo.createdAt}
                </Col>
            </Row>
        );

        // Last Modified
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoLastModifiedLabel`}>
                    Last Modified:
                </Col>
                <Col lg={6} key={`photoLastModifiedValue`}>
                    {photo.updatedAt}
                </Col>
            </Row>
        );

        // Dates
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoLastModifiedLabel`}>
                    Photo Taken On:
                </Col>
                <Col lg={6} key={`photoLastModifiedValue`}>
                    {photo.dates.photoTakenOn}
                </Col>
            </Row>
        );

        // Make & Model
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoMakeAndModelLabel`}>
                    Device:
                </Col>
                <Col lg={6} key={`photoMakeAndModelValue`}>
                    {photo.device.make}, {photo.device.model}
                </Col>
            </Row>
        );

        // Dimensions
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoMakeAndModelLabel`}>
                    Dimensions [w,h]:
                </Col>
                <Col lg={6} key={`photoMakeAndModelValue`}>
                    {photo.dimensions.width}px, {photo.dimensions.height}px
                </Col>
            </Row>
        );

        // Size
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={5} sm={12} key={`photoSizeLabel`}>
                    Size [kb]:
                </Col>
                <Col lg={6} key={`photoSizeValue`}>
                    {photo.dimensions.sizeInKB} kb
                </Col>
            </Row>
        );

        return jsx;
    };
    const setProviderJSX = (provider) => {
        let jsx = [];

        // Provider
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={3} sm={12} key={`photoProviderNameLabel`} className={"text-secondary"}>
                    Provider:
                </Col>
                <Col lg={3} key={`photoProviderNameValue`}>
                    {provider.name.toUpperCase()}
                </Col>
            </Row>
        );

        // Bucket Id
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={3} sm={12} key={`photoBucketIdLabel`}>
                    Bucket Id:
                </Col>
                <Col lg={3} key={`photoBucketIdValue`}>
                    {provider.publicOrBucketId}
                </Col>
            </Row>
        );

        // Status
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={3} sm={12} key={`photoStatusLabel`}>
                    Status:
                </Col>
                <Col lg={3} key={`photoStatusValue`}>
                    {provider.status === "completed" ? "Uploaded" : "Processing"}
                </Col>
            </Row>
        );

        // Status
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={3} sm={12} key={`photoStatusLabel`}>
                    Provider URL:
                </Col>
                <Col lg={8} key={`photoStatusValue`}>
                    {provider.url}
                </Col>
            </Row>
        );


        return jsx;
    };
    const setGPSJSX = (gps) => {
        let jsx = [];

        // Altitude
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={6} sm={12} key={`photoProviderNameLabel`}>
                    Altitude:
                </Col>
                <Col lg={6} key={`photoProviderNameValue`}>
                    {gps.altitude}
                </Col>
            </Row>
        );

        // Coordinates
        jsx.push(
            <Row className={"text-white"}>
                <Col lg={6} sm={12} key={`photoBucketIdLabel`}>
                    Coordinates:
                </Col>
                <Col lg={6} key={`photoBucketIdValue`}>
                    [{gps.coordinates[0]}, {gps.coordinates[1]}]
                </Col>
            </Row>
        );

        return jsx;
    };
    const setSrcSetJSX = (srcSet) => {
        let jsx = [];

        console.log("SrcSet: ", srcSet);

        srcSet.forEach((item, i) => {
            jsx.push(
                <Row className={"text-white"}>
                    <Col lg={2} sm={12} key={`photoProviderNameLabel`}>
                        srcSet #{`${i}`}
                    </Col>
                    <Col lg={10} key={`photoProviderNameValue`}>
                        {item.src} - [{item.width}px, {item.height}px]
                    </Col>
                </Row>
            )
        })



        return jsx;
    };

    const handleSendPhotoToServer = async (e) => {
        e.preventDefault();
        let
            updates = constructPhotoUpdateTemplate(photoAltText, photoTitle, photoDescription, customDownloadName, tags),
            res = null;

        try {
            if(!makePatchCall) {
                res = await updatePhoto({photoId: photo.data._id, updates: updates}).unwrap();
            } else {
                res = await updatePhotoWithPatch({photoId: photo.data._id, updates: updates}).unwrap();
            }
            toast.success(res.data.message);
            return navigate("/admin/photo-management");
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            return toast.error(err?.data?.message || err.error || err.status);
        }
    };

    return (
        <Container>
            <Row className={"text-start mt-5"}>
                {
                    !!photo && (
                        <>
                            <Col lg={4} md={6} sm={12} className={"mb-5"}>
                                <h4 className={"text-white"}>Uploaded By</h4>
                                {
                                    setUserJSX(photo.data.user)
                                }
                            </Col>
                            <Col lg={4} md={6} sm={12}>
                                <h4 className={"text-white"}>Processed</h4>
                                {
                                    setEXIFDataJSX(photo.data)
                                }
                            </Col>
                            <Col lg={4} md={6} sm={12}>
                                <h4 className={"text-white"}>GPS</h4>
                                {
                                    setGPSJSX(photo.data.gps)
                                }
                            </Col>
                            <Col lg={6} md={6} sm={12} className={"mt-5"}>
                                <h4 className={"text-white"}>Provider</h4>
                                {
                                    setProviderJSX(photo.data.provider)
                                }
                            </Col>
                            <Col lg={6} md={6} sm={12} className={"mt-5"}>
                                <h4 className={"text-white"}>Constructed SrcSets</h4>
                                {
                                    setSrcSetJSX(photo.data.srcSet)
                                }
                            </Col>
                            <Col lg={4} md={6} sm={12} className={"mt-5"}>
                                <h4 className={"text-white"}>Mutable Data</h4>
                                <Form className={"mb-5"}>
                                    <Form.Group controlid={"title"} className={"mb-3 mt-3 text-start"}>
                                        <Form.Label column={true} className={"text-white"}>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={"Photo Title"}
                                            value={photoTitle}
                                            onChange={(e) => setPhotoTitle(e.target.value)}
                                        >
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlid={"description"} className={"mb-5 mt-3 text-start"}>
                                        <Form.Label column={true} className={"text-white"}>Custom Download Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={"Custom Download Name"}
                                            value={customDownloadName}
                                            onChange={(e) => setCustomDownloadName(e.target.value)}
                                        >
                                        </Form.Control>
                                    </Form.Group>
                                    <Form.Group controlid={"alt"} className={"mb-5"}>
                                        <InputGroup>
                                            <InputGroup.Text>Alt Text</InputGroup.Text>
                                            <Form.Control as="textarea" aria-label="Alt Text" value={photoAltText}
                                                          onChange={(e) => setPhotoAltText(e.target.value)}/>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group controlid={"description"} className={"mb-5"}>
                                        <InputGroup>
                                            <InputGroup.Text>Description</InputGroup.Text>
                                            <Form.Control as="textarea" aria-label="Description" value={photoDescription}
                                                          onChange={(e) => setPhotoDescription(e.target.value)}/>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group controlid={"Photo Tags"} className={"mb-5"}>
                                        <InputGroup>
                                            <InputGroup.Text>Photo Tags</InputGroup.Text>
                                            <TagField
                                                tags={tags}
                                                addTag={handleAddTag}
                                                removeTag={handleRemoveTag}
                                                maxTags={`${5}`}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Form>
                            </Col>
                            <Col lg={4} md={6} sm={12} className={"mt-5 text-center"}>
                                <Image src={photo.data.provider.url} alt={photo.data.captions.alt} thumbnail />
                            </Col>
                            <Col lg={4} md={6} sm={12} className={"mt-5"}>
                                <Button
                                    variant={"primary"}
                                    className={"mt-3 mb-3 button-85"}
                                    type={"submit"}
                                    disabled={
                                        tags.length === 0 ||
                                        isLoadingUpdatePhoto === true ||
                                        isLoadingPhotoData === true ||
                                        isLoadingUpdatePatch === true
                                    }
                                    onClick={async (e) => handleSendPhotoToServer(e)}
                                >
                                    Update Photo
                                </Button>
                                <Form.Check // prettier-ignore
                                    type="switch"
                                    id="custom-switch"
                                    label="Use PATCH Update (Default: PUT)"
                                    className={"text-white"}
                                    onChange={evt => evt.target.value === "on" ? setMakePatchCall(true) : setMakePatchCall(false)}
                                />
                            </Col>
                        </>
                    )
                }
            </Row>
        </Container>
    )
}