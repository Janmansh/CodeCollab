import React from "react";
import { Navbar } from "react-bootstrap";
import { Container } from "@material-ui/core";
function NavbarComponent() {
  const navbar = {
    height: "3.5rem",
  };
  return (
    <div>
      <Navbar bg="dark" variant="dark" style={navbar} fixed="top">
        <Container>
          <Navbar.Brand href="#home">CodeCollab</Navbar.Brand>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavbarComponent;
