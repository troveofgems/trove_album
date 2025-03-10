import React, {useEffect, useRef, useState} from 'react';
import {Button, Form, Row, Col, Image, InputGroup} from "react-bootstrap";
import ExifReader from 'exifreader';
import {toast} from "react-toastify";
import {Temporal} from "@js-temporal/polyfill";

import {FormContainer} from "../../../components/shared/FormContainer/FormContainer";
import {TagField} from "../../../components/shared/TagField/TagField";
import useTags from "../../../hooks/useTag.hook";
import {useNavigate} from "react-router-dom";
import {useAddPhotoMutation} from "../../../redux/slices/gallery.api.slice";
import {constructPhoto} from "../../../utils/photo.utils";

export const AddPhoto = () => {
    const
        UNKNOWN_MARKER = 'Unknown',
        MAX_TAGS = 5;

    /** Page States & Refs */
    const [photo, setPhoto] = useState({});
    const [picture, setPicture] = useState(null);
    const [imgData, setImgData] = useState(null);//
    const [fileOverLimit, setFileOverLimit] = useState(false);

    /* Form States */
    const [photoTitle, setPhotoTitle] = useState("");
    const [customDownloadName, setCustomDownloadName] = useState("");
    const [photoDescription, setPhotoDescription] = useState("");
    const [photoAltText, setPhotoAltText] = useState("");

    const [dimensions, setDimensions] = useState({ height: 0, width: 0, fileSizeInKB: 0, fileSizeInMB: 0 });
    const [imgEXIFData, setEXIFData] = useState({ dateTimeOriginal: "", fileType: "", gpsLatitude: 0, gpsLongitude: 0, gpsAltitude: "", make: "", model: "" });
    const imgRef = useRef(null);

    /** Page Actions */
    const navigate = useNavigate();
    const { tags, handleAddTag, handleRemoveTag } = useTags(MAX_TAGS);
    const [addPhoto, isLoading] = useAddPhotoMutation();

    const onUploadImage = e => {
        e.preventDefault();
        if (e.target.files[0]) {
            setPicture(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener("load", async () => {
                setImgData(reader.result);
                const exifTags = await ExifReader.load(e.target.files[0]);
                parseEXIFTags(exifTags);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const parseEXIFTags = (exifTags) => {
        let dateObj = null,
            timeObj = null,
            formattedTS = null;

        if(!!exifTags?.DateTimeOriginal?.description) {
            let dateTimeSplit = exifTags?.DateTimeOriginal?.description?.split(" ") || null,
            dateObj = dateTimeSplit[0]?.split(":");
            timeObj = dateTimeSplit[1]?.split(":");
            let parsedDate = Temporal.PlainDateTime.from({
                year: parseInt(dateObj[0]),
                month: parseInt(dateObj[1]),
                day: parseInt(dateObj[2]),
                hour: parseInt(timeObj[0]),
                minute: parseInt(timeObj[1]),
                second: parseInt(timeObj[2]),
            });
            formattedTS = parsedDate.toLocaleString();
        }

        return setEXIFData({
            dateTimeOriginal: (formattedTS || UNKNOWN_MARKER),
            fileType: exifTags?.FileType?.value || UNKNOWN_MARKER,
            gpsLatitude: !!exifTags?.GPSLatitude?.description ?
                parseFloat(exifTags?.GPSLatitude?.description)?.toFixed(3) : UNKNOWN_MARKER,
            gpsLongitude: !!exifTags?.GPSLongitude?.description ?
                parseFloat(exifTags?.GPSLongitude?.description)?.toFixed(3) : UNKNOWN_MARKER,
            gpsAltitude:
                typeof exifTags?.GPSAltitudeRef?.description === "string" ? exifTags?.GPSAltitudeRef?.description :
                    typeof exifTags?.GPSAltitudeRef?.description === "number" ?
                        parseFloat(exifTags?.GPSAltitudeRef?.description).toFixed(3) :
                        UNKNOWN_MARKER,
            make: exifTags["Make"]?.description || `${UNKNOWN_MARKER} Make`,
            model: exifTags["Model"]?.description || `${UNKNOWN_MARKER} Model`
        });
    }

    useEffect(() => {
        if(imgRef.current) {
            let fileSizeInKB = picture ? (picture?.size * 0.001) : 0,
                fileSizeInMB = picture ? (picture?.size * 0.000001) : 0;

            setDimensions({
                height: imgRef.current.naturalHeight,
                width: imgRef.current.naturalWidth,
                fileSizeInKB,
                fileSizeInMB
            });

            if(fileSizeInMB > 9) {
                setFileOverLimit(true);
            } else {
                setFileOverLimit(false);
            }
        }
    }, [imgRef, imgData]);

    const handleSendPhotoToServer = async (e) => {
        e.preventDefault();
        let photo = constructPhoto(
            imgData, photoAltText, photoTitle, photoDescription,
            imgEXIFData, dimensions, customDownloadName, tags
        );

        try {
            const res = await addPhoto(photo).unwrap();
            toast.success(res.message);
            return navigate("/admin/photo-management");
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            return toast.error(err?.data?.message || err.error || err.status);
        }
    };

    return (
        <FormContainer>
            <h2>Add A Photo</h2>
            <Form onSubmit={handleSendPhotoToServer} className={"mb-5"}>
                <Row>
                    <Col xs={12} md={4}>
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
                        <Form.Group controlid={"title"} className={"mb-3 mt-3"}>
                            <Form.Label column={true}>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={"Photo Title"}
                                onChange={(e) => setPhotoTitle(e.target.value)}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlid={"description"} className={"mb-5 mt-3"}>
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
                                    maxTags={`${MAX_TAGS}`}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        {
                            !!picture && (
                                <div className={"mt-3 mb-3"}>
                                    <Image ref={imgRef} src={`${imgData}`} thumbnail />
                                </div>
                            )
                        }
                    </Col>
                    <Col xs={12} md={4}>
                        {
                            !!picture && (
                                <div className={"mt-3 mb-3"}>
                                    <Row className={"text-start mt-4 mb-3"}>
                                        <Col>
                                            <h6 className={"text-decoration-underline"}>Device</h6>
                                            <p className={"pb-0 mb-0"}>{imgEXIFData.make}</p>
                                            <p className={"pb-0 mb-0"}>{imgEXIFData.model}</p>
                                        </Col>
                                        <Col>
                                            <h6 className={"text-decoration-underline"}>GPS Data</h6>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>Latitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{imgEXIFData.gpsLatitude}</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>Longitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{imgEXIFData.gpsLongitude}</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>Altitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{imgEXIFData.gpsAltitude}</span>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={"text-start"}>
                                        <Col>
                                            <h6 className={"text-decoration-underline"}>Image Taken On</h6>
                                            <p>{imgEXIFData.dateTimeOriginal}</p>
                                        </Col>
                                        <Col>
                                            <h6 className={"text-decoration-underline"}>Image Info</h6>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>Nat. Height:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{dimensions.height}px</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>Nat. Width:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{dimensions.width}px</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>File Type:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span>{imgEXIFData.fileType}</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start"}>File Sizes:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <p className={"pb-0 mb-0"}>{dimensions.fileSizeInKB.toFixed(3)} kb</p>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}></div>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-end pt-0"}>{dimensions.fileSizeInMB.toFixed(3)} mb</p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )
                        }
                        <Button variant={"primary"} className={"mt-3 mb-5"} type={"submit"} disabled={(tags.length === 0 || fileOverLimit || !isLoading)}>
                            Process Photo
                        </Button>
                        {
                            fileOverLimit && (
                                <div className={"d-flex w-100 justify-content-center"}>
                                    <p className={"pb-0 mb-0 text-end pt-0 text-danger-emphasis"}>File Limit Exceeded. Upload Must Be Under 9mb.</p>
                                </div>
                            )
                        }
                    </Col>
                </Row>
            </Form>
        </FormContainer>
    );
}