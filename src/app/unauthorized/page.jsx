import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const UnauthorizedPage = () => {
  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Unauthorized</Alert.Heading>
        <p>
          You do not have permission to access this page. Please contact your
          administrator.
        </p>
      </Alert>
    </Container>
  );
};

export default UnauthorizedPage;
