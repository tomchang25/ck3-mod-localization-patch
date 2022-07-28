import React, { useState, useEffect } from "react";

import Alert from "react-bootstrap/Alert";
import { Container, Col, Row, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// class App extends Compo=
const TranslateResult = () => {
  // Constructor
  const { state } = useLocation();
  // console.log(state);

  // TranslateResultModal
  // -----------------------
  const [failureMessage, setFailureMessage] = useState("Failure Mod Here.");

  const [showTransformSuccess, setTransformSuccess] = useState(false);
  const [showTransformFailure, setTransformFailure] = useState(false);
  const handleTransformSuccess = () => {
    setTransformSuccess(true);
    setTransformFailure(false);
  };

  const handleTransformFailure = () => {
    setTransformSuccess(false);
    setTransformFailure(true);
  };

  useEffect(() => {
    async function transformLang() {
      try {
        const response = await axios(
          `http://localhost:8888/translate-language/${state.mainLang}/${state.targetLang}`
        );

        if (response?.status) {
          const result = response.data;

          // console.log(result);
          if (result == null) {
            handleTransformSuccess();
          } else {
            setFailureMessage("Failure Mod: " + result);
            handleTransformFailure();
          }
        }
      } catch (error) {
        // console.log(error);
        setFailureMessage("403 Forbidden");
        handleTransformFailure();
      }
    }

    transformLang();
  }, [state]);

  const navigate = useNavigate();
  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <Container className="p-3">
      <Container className="p-5 mb-4 bg-light rounded-3">
        <h1 className="header">Welcome Mod Localization Patch</h1>
        <hr className="half-rule" />
        <Row className="align-items-center">
          <Col xs="12" className="my-1">
            <Alert show={showTransformSuccess} variant="success">
              <Alert.Heading>Success</Alert.Heading>
              <p>Congratulation, mod localization has been patched.</p>
            </Alert>
            <Alert show={showTransformFailure} variant="danger">
              <Alert.Heading>Failure</Alert.Heading>
              <p>Sorry, there is some problem when the mods are patched.</p>
              <hr />
              <p className="mb-0">{failureMessage}</p>
            </Alert>
          </Col>
        </Row>
        <Row className="flex-row-reverse">
          <Col xs="auto">
            <Button variant="primary" onClick={handleBackHome}>
              Back Home
            </Button>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default TranslateResult;
