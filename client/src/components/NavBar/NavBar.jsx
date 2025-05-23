import "./NavBar.css";

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import {Link} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import {useLogoutMutation} from "../../redux/slices/users.api.slice";
import {clearCredentials} from "../../redux/slices/auth.slice";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

export const NavBar = ({ onViewChange, setIsHovering }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const
        navigate = useNavigate(),
        dispatch = useDispatch(),
        [keywords, setKeywords] = useState("");

    const [sendLogoutToServer] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await sendLogoutToServer().unwrap();
        } catch(err) {
            if(process.env.NODE_ENV === "development") console.error(err);
        }
        dispatch(clearCredentials());
        navigate("/");
    };

    const processKeywordSearch = (e) => {
        e.preventDefault();
        return navigate(`/search?query=${encodeURIComponent(keywords)}`, { state: { query: keywords } });
    };

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary w-100">
                <Container fluid>
                    <div className={"d-lg-flex justify-content-lg-start w-100"}>
                        <Navbar.Brand href="/" className="custom-brand">
                            <div className={"brandImgContainer"}>
                                <img
                                    src={`https://i.ibb.co/Y4gKWb67/lou-painting-ulj3dq.jpg`}
                                    alt={"Louie Banner Button - Let the Heeler Herd You!"}
                                    className={"rounded-5 louPortrait"}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                />
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100%' }}
                                navbarScroll
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                            >
                                <NavDropdown title="Menu" id="navbarScrollingDropdown">
                                    <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("All Items")}>
                                        Full Gallery
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
                                    <Link to={"/"} className={"innerLink dropdown-item"} onClick={() => onViewChange("Videos")}>
                                        Videos
                                    </Link>
                                    <NavDropdown.Divider />
                                    {
                                        !userInfo ? (
                                            <>
                                                <Link to={"/login"} className={"dropdown-item"}>
                                                    Login
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                {userInfo?.data?.isAdmin ? (
                                                    <Link to={"/admin/photo-management"} className={"dropdown-item"}>
                                                        Resource Management
                                                    </Link>
                                                ) : (
                                                    <Link to={"/favorites"} className={"dropdown-item"}>
                                                        Favorites
                                                    </Link>
                                                )}
                                                <Link to={"/"} onClick={handleLogout} className={"dropdown-item"}>
                                                    Logout <small>({userInfo.data.email})</small>
                                                </Link>
                                            </>
                                        )
                                    }
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="https://www.thetroveofgems.tech">
                                        About
                                    </NavDropdown.Item>
                                    <Link to={"/site-filters-explanation"} className={"dropdown-item"}>
                                        About Site Filters
                                    </Link>
                                    <NavDropdown.Item
                                        href={
                                            process.env.NODE_ENV === "development" ?
                                                "http://localhost:5000/api-docs" :
                                                "https://www.photo-album.thetroveofgems.tech/api-docs/"
                                        }>
                                        Swagger UI - API Docs
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                            <div className={"w-100 justify-content-center text-black"}>
                                <p>
                                    {
                                        !userInfo ? (
                                            "Welcome Visitor!"
                                        ) : (
                                            `Hello ${userInfo.data.name}`
                                        )
                                    }
                                </p>
                            </div>
                            <Form className={"d-flex justify-content-lg-end"} onSubmit={(evt) => processKeywordSearch(evt, keywords)}>
                                <Form.Control
                                    id={"searchKeywords"}
                                    type="search"
                                    placeholder="Filter"
                                    className="me-2"
                                    aria-label="Filter"
                                    onChange={(evt) => setKeywords(evt.target.value)}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                />
                                <Button
                                    type={"submit"}
                                    variant="outline-success"
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >Filter</Button>
                            </Form>
                        </Navbar.Collapse>
                    </div>
                </Container>
            </Navbar>
        </>
    );
}
