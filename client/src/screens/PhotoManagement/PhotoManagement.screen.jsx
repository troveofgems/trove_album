import React, {useMemo, useState} from 'react';
import {Button, Table} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {useFetchGalleryQuery, useDeletePhotoMutation} from "../../redux/slices/gallery.api.slice";
import Pagination from "../../components/shared/Pagination/Pagination";

import "./PhotoManagement.Screen.css";
import classnames from "classnames";
import {toast} from "react-toastify";
import {Temporal} from "@js-temporal/polyfill";

export const PhotoManagementScreen = () => {
    const
        DefaultPageSize = 10,
        itemsPerPageCommands = [1, 5, 10, 20],
        navigate = useNavigate(),
        [currentPage, setCurrentPage] = useState(1),
        [pageSizeOverride, setPageSizeOverride] = useState(DefaultPageSize),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        [deletePhoto, isLoading] = useDeletePhotoMutation();

    const currentTableData = useMemo(() => {
        if(!isLoadingGallery && !!photoGallery) {
            console.log("Photo Gallery: ", photoGallery);
            const firstPageIndex = (currentPage - 1) * pageSizeOverride;
            const lastPageIndex = firstPageIndex + pageSizeOverride;
            return (photoGallery?.data.fullGallery.slice(firstPageIndex, lastPageIndex));
        }
        return [];
    }, [isLoadingGallery, currentPage, pageSizeOverride]);

    const handlePhotoDelete = async (e, photoId, cloudinaryPublicId) => {
        const frontendAPIRequestTS = Temporal.Now.instant();
        e.preventDefault();
        try {
            const res = await deletePhoto({ photoId, cloudinaryPublicId: cloudinaryPublicId, frontendAPIRequestTS }).unwrap();
            console.log(res);
            if(res.data.statusCode === 207) {
                return toast.success(res.message);
            }
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            if((err?.status >= 400 && err?.status < 500) && !!err?.data) {
                return toast.error(`${err?.status}: API Error - ${err?.data?.message}`);
            } else {
                return toast.error(`${err?.originalStatus || 500}: Network Error - ${err?.data.message || err?.status}`);
            }
        }
    };

    const handlePhotoUpdate = (photoId) => {
        window.alert(`Update Photo! ${photoId}`);
        //return navigate(`/photos/${photoId}`);
    };

    const changeDefaultPageSize = (val) => {
        setCurrentPage(1);
        return setPageSizeOverride(val);
    }

    return (
        <>
            <div className={"d-flex justify-content-end mb-3"}>
                <Link className={"btn btn-primary"} to={"/admin/photo-management/addPhoto"}>Add Photo To Gallery</Link>
            </div>
            <Table variant={"responsive"} striped={true} hover={true} className={"mt-5 mb-5"}>
                <thead>
                <tr>
                    <th>Order</th>
                    <th className={"text-start"}>Photo Title</th>
                    <th className={"text-start"}>Download Filename</th>
                    <th>Uploaded By</th>
                    <th>System Upload</th>
                    <th className={"text-start"}>Photo Taken On</th>
                    <th>Last Update</th>
                    <th>GPS</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody className={currentTableData?.length > 0 ? "" : "w-100 text-center"}>
                {
                    currentTableData?.map(photo => (
                        <tr key={`managePhoto_${photo.uniqueKey}`}>
                            <td>{photo.order}</td>
                            <td className={"text-start"}>{photo.title}</td>
                            <td className={"text-start"}>{photo.download.filename}</td>
                            <td>{photo.user.fullName}</td>
                            <td>{photo.createdAt}</td>
                            <td className={"text-start"}>{photo.photoTakenOn}</td>
                            <td>{photo.updatedAt}</td>
                            <td>{photo.gps.mapLink === "No Link Available" ? "-" : (
                                <a href={photo.gps.mapLink} target={"_blank"} referrerPolicy={"no-referrer"}>
                                    Map
                                </a>
                            )}
                            </td>
                            <td>
                                <div className={"d-flex justify-content-evenly"}>
                                    <div>
                                        <Button
                                            variant={"outline-secondary"}
                                            as="input"
                                            type="button"
                                            value="Edit"
                                            onClick={() => handlePhotoUpdate(photo._id)}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            variant={"outline-danger"}
                                            as="input"
                                            type="button"
                                            value="Delete"
                                            onClick={(e) => handlePhotoDelete(e, photo._id, photo.cloudinary.publicId)}
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
            {
                (!!photoGallery && photoGallery?.data?.fullGallery.length === 0) && (
                    <h4 className={"text-center"}>No Data Yet!</h4>
                )
            }
            {
                (!!photoGallery && photoGallery?.data?.fullGallery.length > 0) && (
                    <>
                        <div className={"d-flex justify-content-center mt-3"}>
                            <Pagination
                                className={"pagination-bar"}
                                currentPage={currentPage}
                                totalCount={photoGallery?.data?.fullGallery.length}
                                pageSize={pageSizeOverride}
                                onPageChange={page => setCurrentPage(page)}
                            />
                        </div>
                        <div className={"d-flex row text-end mb-5"}>
                            <small>Items Per Page</small>
                            <div>
                                {
                                    itemsPerPageCommands.map(command => (
                                        <button type={"button"} onClick={() => changeDefaultPageSize(command)}
                                                className={classnames('maxItemListSelected', {
                                                    selected: (pageSizeOverride === command)
                                                })}>
                                            {command}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
}