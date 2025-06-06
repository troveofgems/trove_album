import React, {useEffect, useRef, useState} from 'react';
import {Button, Form, Row, Col, Image, InputGroup} from "react-bootstrap";
import ExifReader from 'exifreader';
import {toast} from "react-toastify";
import {Temporal} from "@js-temporal/polyfill";

import {FormContainer} from "../../../components/shared/FormContainer/FormContainer";
import {TagField} from "../../../components/shared/TagField/TagField";
import useTags from "../../../hooks/useTag.hook";
import {useNavigate} from "react-router-dom";
import {useAddPhotoMutation} from "../../../redux/slices/photo.api.slice";
import {constructPhotoCreateTemplate} from "../../../utils/photo.utils";

import Vivianite from "../../../assets/images/logos/vivianite-placeholder-1.jpg";

import "./PhotoManagement.css";

export const AddPhotoScreen = () => {
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
    const imgRefPlaceholder = useRef(null);

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
        let photo = constructPhotoCreateTemplate(
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
            <h2 className={"mt-5 text-white"}>Add A Photo</h2>
            <Form onSubmit={handleSendPhotoToServer} className={"mb-5"}>
                <Row>
                    <Col xs={12} md={4} className={"doublePad text-start"}>
                        <Form.Group controlid={"imageUpload"} className={"button-85"}>
                            <Form.Label column={true} className={"text-white"}>Upload Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                placeholder={"Image"}
                                onChange={onUploadImage}
                                className={"button-85"}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlid={"title"} className={"mb-3 mt-3 text-start"}>
                            <Form.Label column={true} className={"text-white"}>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={"Photo Title"}
                                onChange={(e) => setPhotoTitle(e.target.value)}
                            >
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlid={"description"} className={"mb-5 mt-3 text-start"}>
                            <Form.Label column={true} className={"text-white"}>Custom Download Name</Form.Label>
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
                                <Form.Control as="textarea" aria-label="Alt Text"
                                              onChange={(e) => setPhotoAltText(e.target.value)}/>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlid={"description"} className={"mb-5"}>
                            <InputGroup>
                                <InputGroup.Text>Description</InputGroup.Text>
                                <Form.Control as="textarea" aria-label="Description"
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
                                    maxTags={`${MAX_TAGS}`}
                                />
                            </InputGroup>
                        </Form.Group>
                        <fieldset id={"tagFieldset"} className={"text-white border-white mt-3"}>
                            <legend className={"text-start"}>Tag Topic Requirement Examples:</legend>
                            <small className={"text-center"}>5 Tags Max For Any & All Categories</small>
                            <div className={"text-start mt-3"}>
                                <h6 className={"text-center"}>Family & Friends</h6>
                                <div>
                                    <small>Tag Position 0 (Type): Family & Friends</small>
                                </div>
                                <div>
                                    <small>Tag Position 1-4 (Any): Any String</small>
                                </div>
                            </div>
                            <hr/>
                            <div className={"text-start"}>
                                <h6 className={"text-center"}>Pets</h6>
                                <small>"Pets"</small>
                                <div>
                                    <small>Tag Position 0 (Type): Pets</small>
                                </div>
                                <div>
                                    <small>Tag Position 1-4 (Any): Any String</small>
                                </div>
                            </div>
                            <hr/>
                            <div className={"text-start"}>
                                <h6 className={"text-center"}>Food & Baking</h6>
                                <div>
                                    <small>Tag Position 0 (Type): Food & Baking</small>
                                </div>
                                <div>
                                    <small>Tag Position 1-4 (Any): Any String</small>
                                </div>
                            </div>
                            <hr/>
                            <div className={"text-start"}>
                                <h6 className={"text-center"}>Gardening</h6>
                                <div>
                                    <small>Tag Position 0 (Type): Gardening</small>
                                </div>
                                <div>
                                    <small>Tag Position 1-4 (Any): Any String</small>
                                </div>
                            </div>
                            <hr/>
                            <div className={"text-start"}>
                                <h6 className={"text-center"}>Travel</h6>
                                <div>
                                    <small>Tag Position 0 (Type): Travel</small>
                                </div>
                                <div>
                                    <small>Tag Position 1 (Trip Name): Maui Trip</small>
                                </div>
                                <div>
                                    <small>Tag Position 2 (Location, Comma-Delimited): Maui, HI</small>
                                </div>
                                <div>
                                    <small>Tag Position 3 (Trip Date, Space-Delimited): April 2023</small>
                                </div>
                            </div>
                            <hr/>
                            <div className={"text-start"}>
                                <h6 className={"text-center"}>Video</h6>
                                <small>"Video"</small>
                            </div>
                        </fieldset>
                    </Col>
                    <Col xs={12} md={4} className={"pad"}>
                        {
                            !picture && (
                                <div className={"mt-3 mb-3 text-center"}>
                                    <Image ref={imgRefPlaceholder} src={`${Vivianite}`} thumbnail />
                                </div>
                            )
                        }
                        {
                            !!picture && (
                                <div className={"mt-3 mb-3"}>
                                    <Image ref={imgRef} src={`${imgData}`} thumbnail/>
                                </div>
                            )
                        }
                    </Col>
                    <Col xs={12} md={4} className={"pad"}>
                    {
                            !!picture && (
                                <div className={"mt-3 mb-3"}>
                                    <Row className={"text-start mt-4 mb-3"}>
                                        <Col>
                                            <h6 className={"text-decoration-underline text-white"}>Device</h6>
                                            <p className={"pb-0 mb-0 text-white"}>{imgEXIFData.make}</p>
                                            <p className={"pb-0 mb-0 text-white"}>{imgEXIFData.model}</p>
                                        </Col>
                                        <Col>
                                            <h6 className={"text-decoration-underline text-white"}>GPS Data</h6>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>Latitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{imgEXIFData.gpsLatitude}</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>Longitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{imgEXIFData.gpsLongitude}</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>Altitude:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{imgEXIFData.gpsAltitude}</span>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className={"text-start text-white"}>
                                        <Col>
                                            <h6 className={"text-decoration-underline  text-white"}>Image Taken On</h6>
                                            <p>{imgEXIFData.dateTimeOriginal}</p>
                                        </Col>
                                        <Col>
                                            <h6 className={"text-decoration-underline text-white"}>Image Info</h6>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>Nat. Height:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{dimensions.height}px</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>Nat. Width:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{dimensions.width}px</span>
                                                </div>
                                            </div>
                                            <div className={"d-flex w-100"}>
                                                <div className={"w-50"}>
                                                    <p className={"pb-0 mb-0 text-start text-white"}>File Type:</p>
                                                </div>
                                                <div className={"w-50 text-end"}>
                                                    <span className={"text-white"}>{imgEXIFData.fileType}</span>
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
                        <Button variant={"primary"} className={"mt-3 mb-5 button-85"} type={"submit"} disabled={(tags.length === 0 || fileOverLimit || !isLoading)}>
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