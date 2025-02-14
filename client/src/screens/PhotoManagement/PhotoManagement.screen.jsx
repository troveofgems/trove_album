import React, {useMemo, useState} from 'react';
import {Table} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {useFetchGalleryQuery, useDeletePhotoMutation} from "../../redux/slices/gallery.api.slice";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Pagination from "../../components/shared/Pagination/Pagination";

import "./PhotoManagement.Screen.css";
import classnames from "classnames";
import {toast} from "react-toastify";

export const PhotoManagementScreen = () => {
    const
        DefaultPageSize = 10,
        navigate = useNavigate(),
        [currentPage, setCurrentPage] = useState(1),
        [pageSizeOverride, setPageSizeOverride] = useState(DefaultPageSize),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery(),
        [deletePhoto, isLoading] = useDeletePhotoMutation();

    const currentTableData = useMemo(() => {
        if(!isLoadingGallery && !!photoGallery) {
            const firstPageIndex = (currentPage - 1) * pageSizeOverride;
            const lastPageIndex = firstPageIndex + pageSizeOverride;
            return (photoGallery?.data.fullGallery.slice(firstPageIndex, lastPageIndex));
        }
        return [];
    }, [isLoadingGallery, currentPage, pageSizeOverride]);

    const handlePhotoDelete = async (e, photoId, photoDownloadName) => {
        e.preventDefault();
        try {
            const res = await deletePhoto({ photoId }).unwrap();
            if(res.status === 200) {
                return toast.success(res.message);
            }
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
            if((err?.status >= 400 && err?.status < 500) && !!err?.data) {
                return toast.error(`${err.status}: API Error - ${err.data.message}`);
            } else {
                return toast.error(`${err.originalStatus}: Network Error - ${err.status}`);
            }
        }
    };

    const handlePhotoUpdate = (photoId) => {
        window.alert(`Update Photo! ${photoId}`);
        return navigate(`/photos/${photoId}`);
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
            <Table variant={"responsive"} striped={true} hover={true} className={"mt-5"}>
                <thead>
                <tr>
                    <th>Order</th>
                    <th className={"text-start"}>Title</th>
                    <th>Download Filename</th>
                    <th>Uploaded By</th>
                    <th>Uploaded On</th>
                    <th>Photo Taken On</th>
                    <th>Last Updated</th>
                    <th>Version</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody className={currentTableData?.length > 0 ? "" : "w-100 text-center"}>
                {
                    currentTableData?.map(photo => (
                        <tr key={photo._id}>
                            <td>{photo.order}</td>
                            <td className={"text-start"}>{photo.title}</td>
                            <td>{photo.download.filename}</td>
                            <td>{photo.user.fullName}</td>
                            <td>{photo.createdAt}</td>
                            <td>null</td>
                            <td>{photo.updatedAt}</td>
                            <td>{photo.__v}</td>
                            <td>
                                <div className={"d-flex justify-content-evenly"}>
                                    <div>
                                        <EditIcon
                                            key={photo._id}
                                            onClick={() => handlePhotoUpdate(photo._id)}
                                            className={"actionIcon"}
                                        />
                                    </div>
                                    <div>
                                        <DeleteIcon
                                            key={photo._id}
                                            color={"error"}
                                            onClick={(e) => handlePhotoDelete(e, photo._id, photo.download.filename)}
                                            className={"actionIcon"}
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
                                <button type={"button"} onClick={() => changeDefaultPageSize(1)}
                                        className={classnames('maxItemListSelected', {
                                            selected: (pageSizeOverride === 1)
                                        })}>
                                    1
                                </button>
                                <button type={"button"} onClick={() => changeDefaultPageSize(5)}
                                        className={classnames('maxItemListSelected', {
                                            selected: (pageSizeOverride === 5)
                                        })}>
                                    5
                                </button>
                                <button type={"button"} onClick={() => changeDefaultPageSize(10)}
                                        className={classnames('maxItemListSelected', {
                                            selected: (pageSizeOverride === 10)
                                        })}>
                                    10
                                </button>
                                <button type={"button"} onClick={() => changeDefaultPageSize(20)}
                                        className={classnames('maxItemListSelected', {
                                            selected: (pageSizeOverride === 20)
                                        })}>
                                    20
                                </button>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
}