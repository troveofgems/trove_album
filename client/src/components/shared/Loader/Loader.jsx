import React from "react";
import {Spinner} from "react-bootstrap";

export const Loader = () => (
    <Spinner
        animation={"border"}
        role={"status"}
        style={{
            width: "100px",
            height: "100px",
            margin: "auto",
            display: "block"
        }}
    ></Spinner>
)