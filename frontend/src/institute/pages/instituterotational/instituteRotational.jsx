import React from 'react';
import { Container, Card } from 'react-bootstrap';

const InstituteRotational = () => {
  return (
    <Container className="py-5">
      <Card className="text-center shadow">
        <Card.Header as="h2">Rotational Internship Program</Card.Header>
        <Card.Body>
          <Card.Title className="mb-4">Welcome to the Rotational Page</Card.Title>
          <Card.Text>
            Explore our rotational internship opportunities where you can experience multiple departments
            and gain diverse skills during your internship period.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InstituteRotational;
