import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Button, Row, Col } from 'react-bootstrap';
import { FiMenu, FiArrowLeft } from 'react-icons/fi';

const RotationalapiSecond = () => {
  const [showTip, setShowTip] = useState(true);

  // Hide tip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container className="py-5">
      {showTip && (
        <Alert 
          variant="info" 
          className="mb-4 shadow-sm" 
          dismissible 
          onClose={() => setShowTip(false)}
        >
          <Alert.Heading>Navigation Tip</Alert.Heading>
          <Row className="align-items-center">
            <Col md={8}>
              <p className="mb-1">
                To access the sidebar menu, click the <FiMenu className="mx-1" /> menu button 
                in the top left corner of the screen.
              </p>
              <p className="mb-0 text-muted small">
                This sidebar contains all navigation options for the Rotational module and other system features.
              </p>
            </Col>
            <Col md={4} className="text-center text-md-end mt-3 mt-md-0">
              <div className="position-relative d-inline-block">
                <FiArrowLeft size={30} className="position-absolute" style={{ left: "-40px", top: "5px" }} />
                <Button size="sm" variant="outline-primary">
                  <FiMenu size={18} className="me-2" /> Menu button location
                </Button>
              </div>
            </Col>
          </Row>
        </Alert>
      )}
      
      <Card className="text-center shadow">
        <Card.Body>
          <Card.Title className="mb-4">Welcome to the Rotational API page 2</Card.Title>
          <Card.Text>
            This page demonstrates the integration with the Rotational API system.
            Use the sidebar menu to navigate between different rotational features.
          </Card.Text>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => setShowTip(true)}
            className="mt-3"
          >
            <FiMenu className="me-1" /> Show sidebar tip
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RotationalapiSecond;