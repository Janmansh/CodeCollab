import React, { useState } from "react";
import ReactLoading from "react-loading";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@material-ui/core";
import Editor from "./Editor";
import { DropdownButton, Dropdown, Badge } from "react-bootstrap";
import { Container, Row, Col } from "react-grid-system";
import UserInputOutput from "./UserInputOutput";
import axios from "axios";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CodeEditor = (props) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [codeMirrorMode, setCodeMirrorMode] = useState("clike");
  const [codeLanguage, setCodeLanguage] = useState("C++");
  const [userOutput, setuserOutput] = useState("");

  const [userInput, setUserInput] = useState("");
  const [submitLoad, setSubmitLoad] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  const [open, setDialogOpen] = useState(false);
  const [TestLoad, setTestLoad] = useState(false);

  const languageOptions = {
    "C++": "clike",
    Java: "clike",
    C: "clike",
    Python: "python",
  };

  const domain = `http://localhost:8080`;
  const buttonHandlerIDE = () => {
    axios
      .post(`${domain}/run`, {
        code: code,
        language: codeLanguage,
        userInput: userInput,
        submissionType: "test",
      })
      .then((res) => {
        if (Object.entries(res)[1][1] !== 200) {
          setDialogTitle("Error");
          setDialogContent("Your code could not be compiled.Please Try Later");
        } else {
          setuserOutput(res.data.output);
        }
      });
  };

  const loadingOptions = {
    type: "spin",
    color: "#347deb",
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <ReactLoading
            type={loadingOptions.type}
            color={loadingOptions.color}
            height={100}
            width={100}
          />
        </div>
      ) : (
        <>
          <Container>
            <Row>
              <Col sm={6}>
                <DropdownButton d="dropdown-basic-button" title={codeLanguage}>
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
                  code={code}
                  languageMode={codeMirrorMode}
                  onChange={setCode}
                />
                {TestLoad ? (
                  <>
                    <CircularProgress color="secondary" size="1.5rem " />
                  </>
                ) : (
                  <>
                    <Button
                      style={{
                        color: "white",
                        padding: "0.3rem ",
                        // borderColor: "white",
                        marginLeft: "auto",
                        background: "#087afc",
                      }}
                      variant="outlined"
                      onClick={() => buttonHandlerIDE("test")}
                    >
                      Test
                    </Button>
                  </>
                )}
                {submitLoad ? (
                  <>
                    <CircularProgress color="secondary" size="2rem " />
                  </>
                ) : (
                  <>
                    <Dialog
                      open={open}
                      TransitionComponent={Transition}
                      keepMounted
                      onClose={handleDialogClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                      PaperProps={{
                        style: {
                          backgroundColor: "#424242",
                          boxShadow: "none",
                        },
                      }}
                    >
                      <DialogTitle
                        id="alert-dialog-title"
                        style={{
                          color: "white",
                        }}
                      >
                        {dialogTitle}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText
                          id="alert-dialog-description"
                          style={{
                            color: "#bebec3",
                          }}
                        >
                          {dialogContent}
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        {/* <Button onClick={handleDialogClose} color="primary">
                          Disagree
                        </Button> */}
                        <Button
                          onClick={handleDialogClose}
                          color="secondary"
                          autoFocus
                        >
                          Okay
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
                <br />
                <Badge bg="success">Input</Badge>
                <UserInputOutput
                  text={userInput}
                  onChange={setUserInput}
                  isInput={true}
                />
                <Badge bg="success">Output</Badge>
                <UserInputOutput text={userOutput} isInput={false} />
                {/* <Link to={"/submissions/" + problemID}>Submissions</Link> */}
              </Col>
            </Row>
          </Container>
        </>
      )}
    </>
  );
};

export default CodeEditor;
