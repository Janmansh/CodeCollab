import React, { useState } from "react";

import { Button, CircularProgress } from "@material-ui/core";
import Editor from "./Editor";
import { DropdownButton, Dropdown, Badge } from "react-bootstrap";
import { Container, Row, Col } from "react-grid-system";
import UserInputOutput from "./UserInputOutput";
import axios from "axios";

const CodeEditor = (props) => {
  // const [code, setCode] = useState("");
  const [codeMirrorMode, setCodeMirrorMode] = useState("clike");
  const [codeLanguage, setCodeLanguage] = useState("C++");
  const [userOutput, setuserOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [TestLoad, setTestLoad] = useState(false);

  const languageOptions = {
    "C++": "clike",
    Java: "clike",
    C: "clike",
    Python: "python",
  };

  const domain = `http://localhost:8080`;
  const buttonHandlerIDE = () => {
    setTestLoad(true);
    axios
      .post(`${domain}/run`, {
        code: props.vl,
        language: codeLanguage,
        userInput: userInput,
        submissionType: "test",
      })
      .then((res) => {
        if (Object.entries(res)[1][1] !== 200) {
          alert("Your code could not be compiled.Please Try Later");
        } else {
          setuserOutput(res.data.output);
          setTestLoad(false);
        }
      });
  };

  return (
    <>
      <Container
        style={{
          marginTop: "3.5rem",
        }}
      >
        <Row>
          <Col sm={16}>
            <DropdownButton
              id="dropdown-basic-button"
              title={codeLanguage}
              style={{
                marginBottom: ".3rem",
                marginTop: ".3rem",
              }}
            >
              {Object.keys(languageOptions).map((key, index) => {
                return (
                  <Dropdown.Item
                    href="#"
                    onClick={() => {
                      setCodeMirrorMode(languageOptions[key]);
                      setCodeLanguage(key);
                    }}
                  >
                    {key}
                  </Dropdown.Item>
                );
              })}
            </DropdownButton>
            <Editor
              code={props.vl}
              languageMode={codeMirrorMode}
              onChange={props.hcg}
            />
            {TestLoad ? (
              <>
                <CircularProgress color="secondary" size="1.5rem " />
              </>
            ) : (
              <>
                <Button
                  style={{
                    marginLeft: "auto",
                    marginTop: ".3rem",
                    background: "#00cc00",
                  }}
                  variant="contained"
                  size="large"
                  onClick={() => buttonHandlerIDE("test")}
                >
                  Test
                </Button>
              </>
            )}
            <br />
            <br />
          </Col>
        </Row>
        <Row
          style={{
            paddingBottom: ".3rem",
          }}
        >
          <Col>
            <Badge bg="primary">Input</Badge>
            <UserInputOutput
              text={userInput}
              onChange={setUserInput}
              isInput={true}
            />
          </Col>
          <Col>
            <Badge bg="primary">Output</Badge>
            <UserInputOutput text={userOutput} isInput={false} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CodeEditor;
