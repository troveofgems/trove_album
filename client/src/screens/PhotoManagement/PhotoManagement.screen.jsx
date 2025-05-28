import React, {useMemo, useState} from 'react';
import {Button, Table} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";

// Components
import Pagination from "../../components/shared/Pagination/Pagination";

// RTK API Functions
import { useFetchPhotosForManagementQuery } from "../../redux/slices/gallery.api.slice";
import { useDeletePhotoMutation } from "../../redux/slices/gallery.api.slice";

// Utils & Constants
import {ONE, FIVE, TEN, TWENTY} from "../../constants/frontend.constants";
import {changeDefaultPageSize, handlePhotoDelete, handlePhotoUpdate} from "../../utils/photo.utils";

// CSS Imports
import "./PhotoManagement.Screen.css";
import classnames from "classnames";

export const PhotoManagementScreen = () => {
    const // Component State
        DefaultPageSize = TEN,
        itemsPerPageCommands = [ONE, FIVE, TEN, TWENTY],
        [currentPage, setCurrentPage] = useState(ONE),
        [pageSizeOverride, setPageSizeOverride] = useState(DefaultPageSize);

    const // Component Actions
        {
            data: photoGallery,
            isLoading: isLoadingGallery,
            error: galleryError
        } = useFetchPhotosForManagementQuery(),
        [deletePhoto, isLoading] = useDeletePhotoMutation(),
        navigate = useNavigate();

    const currentTableData = useMemo(() => {
        if(!isLoadingGallery && !!photoGallery) {
            const firstPageIndex = (currentPage - 1) * pageSizeOverride;
            const lastPageIndex = firstPageIndex + pageSizeOverride;
            return (photoGallery?.data?.photos?.imageList?.slice(firstPageIndex, lastPageIndex));
        }
        return [];
    }, [isLoadingGallery, currentPage, pageSizeOverride, photoGallery]);

    return (
        <>
            <h2 className={"text-center text-white mt-5"}>Resource Management</h2>
            <div className={"d-flex justify-content-end mt-5 mb-3"}>
                <Link className={"btn button-85 mx-5"} to={"/admin/photo-management/addPhoto"} role={"button"}>Add Photo To Gallery</Link>
                <Link className={"btn button-85"} to={"/admin/video-management/addVideo"} role={"button"}>Add Video To Gallery</Link>
            </div>
            <Table id={"tableData"} variant={"responsive"} striped={true} hover={true} className={"mt-5 mb-5"}>
                <thead>
                <tr>
                    <th>Order</th>
                    <th className={"text-start"}>Thumbnail</th>
                    <th className={"text-start"}>Photo Title</th>
                    <th>Uploaded By</th>
                    <th>System Upload</th>
                    <th className={"text-start"}>Photo Taken On</th>
                    <th>Last Update</th>
                    <th>GPS</th>
                    <th>Status</th>
                    <th></th>
                </tr>
                </thead>
                <tbody className={currentTableData?.length > 0 ? "" : "w-100 text-center"}>
                {
                    currentTableData?.map(photo => (
                        <tr key={`managePhoto_${photo.key}`}>
                            <td>{photo.order}</td>
                            <td className={"text-start"}>
                                <img src={photo.provider.url} alt={"test"} width={75} height={75}/>
                            </td>
                            <td className={"text-start"}>{photo.title}</td>
                            <td>{photo.user.fullName}</td>
                            <td>{photo.createdAt}</td>
                            <td className={"text-start"}>{photo.photoTakenOn}</td>
                            <td>{photo.updatedAt}</td>
                            <td>{photo.gps.mapLink === "No Link Available" ? "-" : (
                                <a
                                    href={photo.gps.mapLink}
                                    target={"_blank"}
                                    referrerPolicy={"no-referrer"}
                                    rel={"noreferrer"}
                                >
                                    Map
                                </a>
                            )}
                            </td>
                            <td>{photo.provider.status === "completed" ? "Uploaded" : "Pending"}</td>
                            <td>
                                <div className={"d-flex justify-content-evenly"}>
                                    <div className={"mx-3"}>
                                        <Button
                                            variant={"outline-secondary"}
                                            as="input"
                                            type="button"
                                            value="Edit"
                                            onClick={() => handlePhotoUpdate(photo._id, navigate)}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            variant={"outline-danger"}
                                            as="input"
                                            type="button"
                                            value="Delete"
                                            onClick={async () => await handlePhotoDelete(photo._id, deletePhoto, navigate)}
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
                (!!photoGallery && photoGallery?.data?.photos?.imageList?.length === 0) && (
                    <>
                        <h4 className={"text-center text-white mb-3"}>No Data Yet!</h4>
                        <h6 className={"text-center text-white"}>Add A Photo To Get Started</h6>
                    </>
                )
            }
            {
                (!!photoGallery && photoGallery?.data?.photos?.imageList?.length > 0) && (
                    <>
                        <div className={"d-flex justify-content-center mt-3 text-white"}>
                            <Pagination
                                className={"pagination-bar"}
                                currentPage={currentPage}
                                totalCount={photoGallery?.data?.photos?.imageList?.length}
                                pageSize={pageSizeOverride}
                                onPageChange={page => setCurrentPage(page)}
                            />
                        </div>
                        <div className={"d-flex row text-end mb-5"}>
                            <div className={"mb-5 d-flex justify-content-end"}>
                                <div className={"w-25 d-flex justify-content-evenly"}>
                                    <small className={"text-white"}>Items Per Page</small>
                                    {
                                        itemsPerPageCommands.map(command => (
                                            <button
                                                type={"button"}
                                                onClick={() => changeDefaultPageSize(command, setCurrentPage, setPageSizeOverride)}
                                                className={classnames(
                                                    `maxItemListSelected btn btn-secondary ${pageSizeOverride === command ? "button-85 button-85-item" : ""}`,
                                                    {
                                                        selected: (pageSizeOverride === command)
                                                    }
                                                    )
                                                }
                                                key={`list_size_${command}`}
                                            >
                                                {command}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </>
    );
}