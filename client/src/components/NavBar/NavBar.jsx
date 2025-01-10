import "./NavBar.css";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import AmberSap from "../../assets/images/logos/raw_amber.jpg";

import { Link } from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import {useLogoutMutation} from "../../redux/slices/users.api.slice";
import {clearCredentials} from "../../redux/slices/auth.slice";
import {useNavigate} from "react-router-dom";

export const NavBar = ({ onViewChange }) => {
    const { userInfo } = useSelector((state) => state.auth);

    const navigate = useNavigate(),
        dispatch = useDispatch();

    const [sendLogoutToServer] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await sendLogoutToServer().unwrap();
            dispatch(clearCredentials());
            navigate("/");
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
        }
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary w-100 mb-5">
            <Container fluid>
                <Navbar.Brand href="/" className="bg-white custom-brand">
                    <img src={`${AmberSap}`} alt={"Alt"} width={100} height={100} className={"custom-brand"}/>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{ maxHeight: '100px' }}
                        navbarScroll
                    >
                        <NavDropdown title="Change Gallery" id="navbarScrollingDropdown">
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("All Items")}>
                                All Items
                            </Link>
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Family & Friends")}>
                                Family & Friends
                            </Link>
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Pets")}>
                                Pets
                            </Link>
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Food & Baking")}>
                                Food & Baking
                            </Link>
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Gardening")}>
                                Gardening
                            </Link>
                            <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Travel")}>
                                Travel
                            </Link>
                            <NavDropdown.Divider />
                            {
                                !userInfo ? (
                                    <>
                                        <NavDropdown.Item href="https://www.thetroveofgems.tech">
                                            About
                                        </NavDropdown.Item>
                                        <Link to={"/login"} className={"dropdown-item"}>
                                            Login
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {userInfo?.data?.isAdmin ? (
                                            <Link to={"/admin/photo-management"} className={"dropdown-item"}>
                                                Photo Management
                                            </Link>
                                        ) : (
                                            <Link to={"/favorites"} className={"dropdown-item"}>
                                                Favorites
                                            </Link>
                                        )}
                                        <Link to={"/"} onClick={handleLogout} className={"dropdown-item"}>
                                            Logout
                                        </Link>
                                    </>
                                )
                            }
                        </NavDropdown>
                    </Nav>
                    <Form className="d-flex">
                        <Form.Control
                            type="search"
                            placeholder="Search"
                            className="me-2"
                            aria-label="Search"
                        />
                        <Button variant="outline-success">Search</Button>
                    </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
