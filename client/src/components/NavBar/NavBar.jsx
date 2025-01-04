import "./NavBar.css";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import AmberSap from "../../assets/images/logos/amber_sap.jpg";

import { Link } from "react-router-dom";

export const NavBar = ({ onViewChange }) => {
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
                            <NavDropdown.Item onClick={() => onViewChange("Show All")}>
                                <Link to={"/"} className={"innerLink"}>
                                    Show All
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onViewChange("Family")}>
                                <Link to={"/"} className={"innerLink"}>
                                    Family
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onViewChange("Pets")}>
                                <Link to={"/"} className={"innerLink"}>
                                    Pets
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onViewChange("Food & Baking")}>
                                <Link to={"/"} className={"innerLink"}>
                                    Food & Baking
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => onViewChange("Gardening")}>
                                <Link to={"/"} className={"innerLink"}>
                                    Gardening
                                </Link>
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="https://www.thetroveofgems.tech">
                                About
                            </NavDropdown.Item>
                            <NavDropdown.Item href={"/login"}>
                                <Link to={"/login"}>
                                    Login
                                </Link>
                            </NavDropdown.Item>
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
