import React, {useEffect, useState} from 'react';
import {Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useFetchGalleryQuery} from "../../redux/slices/gallery.api.slice";

export const PhotoManagementScreen = () => {
    const
        [photoList, setPhotoList] = useState([]),
        { data: photoGallery, isLoading: isLoadingGallery, error: galleryError } = useFetchGalleryQuery();

    useEffect(() => {
        if(!isLoadingGallery) {
            setPhotoList(photoGallery.data.fullGallery);
            console.log("Photo List Set: ", photoGallery.data.fullGallery);
        }
    }, [isLoadingGallery]);

    return (
        <>
            <Link className={"btn btn-primary mt-5"} to={"/admin/photo-management/addPhoto"}>Add Photo To Gallery</Link>
            <Table variant={"responsive"} striped={true} hover={true} className={"mt-5"}>
                <thead>
                <tr>
                    <th>Order</th>
                    <th className={"text-start"}>Title</th>
                    <th>Download Filename</th>
                    <th>Uploaded By</th>
                    <th>Created On</th>
                    <th>Last Updated</th>
                    <th>Version</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody className={photoList?.length > 0 ? "" : "w-100 text-center"}>
                {
                    photoList?.length > 0 && photoList?.map(photo => (
                        <tr>
                            <td>{photo.order || "Missing"}</td>
                            <td className={"text-start"}>{photo.title}</td>
                            <td>{photo.download.filename}</td>
                            <td>{photo.user.fullName}</td>
                            <td>{photo.createdAt}</td>
                            <td>{photo.updatedAt}</td>
                            <td>{photo.__v}</td>
                            <td></td>
                        </tr>
                    ))
                }
                </tbody>
                {
                    (!photoList || photoList?.length === 0) && (
                        <h4 className={"text-center"}>No Data Yet!</h4>
                    )
                }
            </Table>
        </>
    );
}