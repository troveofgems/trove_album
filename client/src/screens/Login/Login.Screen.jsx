import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';

import { useLoginMutation } from "../../redux/slices/users.api.slice";
import { setCredentials } from "../../redux/slices/auth.slice";
/*import {toast} from "react-toastify";*/

import { Loader } from "../../components/shared/Loader/Loader";

import { FormContainer } from "../../components/shared/FormContainer/FormContainer";

export const LoginScreen = () => {
    const
        [email, setEmail] = useState(''),
        [password, setPassword] = useState("");

    const
        dispatch = useDispatch(),
        navigate = useNavigate();

    const [login, { isLoading: isLoadingLoginReq }] = useLoginMutation();

    const { userInfo } = useSelector((state) => state.auth);

    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const redirect = sp.get('redirect') || "/";

    useEffect(() => {
        if(userInfo) {
            userInfo.data.isAdmin ? navigate("/admin/photo-management") : navigate("/favorites");
        }
    }, [userInfo, redirect, navigate]);


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials({...res}));
            navigate(redirect);
        } catch(err) {
            if(process.env.NODE_ENV === 'development') console.error(err);
            return //toast.error(err?.data?.message || err.error || err.status);
        }
    }

    return (
        <FormContainer>
            <Form onSubmit={submitHandler} className={"w-50 m-auto"}>
                <Form.Group controlid={"email"} className={"my-3"}>
                    <Form.Label column={true} className={"text-white"}>Account Id</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        placeholder={"Account Id"}
                        onChange={(e) => setEmail(e.target.value)}
                    >
                    </Form.Control>
                </Form.Group>
                <Form.Group controlid={"password"} className={"my-3"}>
                    <Form.Label column={true} className={"text-white"}>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        placeholder={"*********************"}
                        onChange={(e) => setPassword(e.target.value)}
                    >
                    </Form.Control>
                </Form.Group>
                { isLoadingLoginReq && <Loader /> }
                <Button type={"submit"} variant={"primary"} className={"mt-2"} disabled={isLoadingLoginReq}>
                    Login
                </Button>
            </Form>
        </FormContainer>
    );
}