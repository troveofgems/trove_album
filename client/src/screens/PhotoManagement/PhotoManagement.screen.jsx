import React from 'react';
import {Table} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

export const PhotoManagementScreen = () => {
    const { photos: GalleryPhotos } = useSelector((state) => state.gallery);

    console.log("Gallery Photos For Table: ", GalleryPhotos);

    return (
        <>
            <h1>Photo Management</h1>
            <Link className={"btn btn-primary mt-5"} to={"/admin/photo-management/addPhoto"}>Add Photo To Gallery</Link>
            <Table variant={"responsive"} striped={true} hover={true} className={"mt-5"}>
                <thead>
                <tr>
                    <th>Order</th>
                    <th>Version</th>
                    <th>Id</th>
                    <th>Title</th>
                    <th>Download Filename</th>
                    <th>Uploaded By</th>
                    <th>Created On</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody className={GalleryPhotos?.length > 0 ? "" : "w-100 text-center"}>
                {
                    GalleryPhotos?.data?.length > 0 && GalleryPhotos?.data?.map(photo => (
                        <tr>
                            <td>{photo.order || "Missing"}</td>
                            <td>{photo.__v}</td>
                            <td>{photo._id}</td>
                            <td>{photo.captions.title}</td>
                            <td>{photo.download.filename}</td>
                            <td>{photo.user}</td>
                            <td>{photo.createdAt}</td>
                            <td>{photo.updatedAt}</td>
                            <td></td>
                        </tr>
                    ))
                }
                </tbody>
                {
                    (!GalleryPhotos || GalleryPhotos?.data?.length === 0) && (
                        <h4 className={"text-center"}>No Data Yet!</h4>
                    )
                }
            </Table>
        </>
    );
}