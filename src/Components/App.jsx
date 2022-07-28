import React, { useState, useEffect } from "react";
import "../Assets/Styles/App.css";

import { Button, Form, Container, Col, Row, Modal } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const schema = yup
  .object({
    inputMainLang: yup
      .string()
      .required()
      .notOneOf([yup.ref("inputTargetLang"), null]),
    inputTargetLang: yup
      .string()
      .required()
      .notOneOf([yup.ref("inputMainLang"), null]),
  })
  .required();

// class App extends Compo=
const App = () => {
  // Constructor
  // console.log("App")

  // SteamWorkshopCheckModal
  // -----------------------
  const [showSteamWorkshopCheckModal, setShowSteamWorkshopCheckModal] =
    useState(false);
  const handleShowSteamWorkshopCheckModal = () =>
    setShowSteamWorkshopCheckModal(true);
  const handleCloseApp = () => {
    // window.close();
    setShowSteamWorkshopCheckModal(false);
    setShowNetworkFailureModal(false);
  };

  const [showNetworkFailureModal, setShowNetworkFailureModal] = useState(false);
  const handleShowNetworkFailureModal = () => setShowNetworkFailureModal(true);

  useEffect(() => {
    async function checkApp() {
      try {
        const response = await axios(
          `http://localhost:8888/check-container-mod`
        );

        if (response?.ok) {
          const appState = await response.json();

          // console.log(appState);

          if (appState === false) {
            handleShowSteamWorkshopCheckModal();
          }
        }
      } catch (error) {
        // console.log(error);
        handleShowNetworkFailureModal();
      }
    }

    checkApp();
  }, []);

  function handleSteamWorkshopLink() {
    window.open(
      "https://steamcommunity.com/sharedfiles/filedetails/?id=2802753831",
      "_blank"
    );
  }

  // Form
  // -----------------------

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      inputMainLang: "english",
      inputTargetLang: "simp_chinese",
    },
  });

  const navigate = useNavigate();
  const onSubmit = (data) => {
    // console.log(data);
    // navigate(`/translate-result/${data.inputMainLang}/${data.inputTargetLang}`);

    navigate(`/translate-result`, {
      state: {
        mainLang: data.inputMainLang,
        targetLang: data.inputTargetLang,
      },
    });
  };

  return (
    <Container className="p-3">
      <Container className="p-5 mb-4 bg-light rounded-3">
        <h1 className="header">Welcome Mod Localization Patch</h1>
        <hr className="half-rule" />
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Row className="align-items-center">
            <Col xs="auto" className="my-1">
              <Alert variant="success">
                <Alert.Heading>Hey, nice to see you</Alert.Heading>
                <p>
                  Aww yeah, you successfully read this important alert message.
                  This example text is going to run a bit longer so that you can
                  see how spacing within an alert works with this kind of
                  content.
                </p>
                <hr />
                <p className="mb-0">
                  Whenever you need to, be sure to use margin utilities to keep
                  things nice and tidy.
                </p>
              </Alert>
            </Col>
            <Form.Group className="mb-3">
              <Form.Label>Main Language</Form.Label>
              <Form.Control
                as="select"
                isInvalid={!!errors.inputTargetLang}
                {...register("inputMainLang")}
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="russian">Russian</option>
                <option value="spanish">Spanish</option>
                <option value="korean">Korean</option>
                <option value="simp_chinese">中文</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Main Language & Target Language should be different
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Language</Form.Label>
              <Form.Control
                as="select"
                isInvalid={!!errors.inputTargetLang}
                {...register("inputTargetLang")}
              >
                <option value="english">English</option>
                <option value="french">French</option>
                <option value="russian">Russian</option>
                <option value="spanish">Spanish</option>
                <option value="korean">Korean</option>
                <option value="simp_chinese">中文</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                Main Language & Target Language should be different
              </Form.Control.Feedback>
            </Form.Group>

            <Col xs="auto" className="my-1">
              <Button variant="outline-primary" type="submit">
                Transform
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>

      <Modal show={showSteamWorkshopCheckModal} onHide={handleCloseApp}>
        <Modal.Header closeButton>
          <Modal.Title>Missing mod detected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Woops, you forgot to subscribe the mod, which needs to be used as a
          container.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApp}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSteamWorkshopLink}>
            Go to steam workshop
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNetworkFailureModal} onHide={handleCloseApp}>
        <Modal.Header closeButton>
          <Modal.Title>Failure</Modal.Title>
        </Modal.Header>
        <Modal.Body>403 Forbidden</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseApp}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;
