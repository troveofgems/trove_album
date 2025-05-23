import {Container, Row, Col} from 'react-bootstrap';

export const FormContainer = ({ children }) => {
    return (
        <Container>
            <Row className={"justify-content-md-center"}>
                <Col xs={12} md={12} lg={12}>
                    {children}
                </Col>
            </Row>
        </Container>
    )
};