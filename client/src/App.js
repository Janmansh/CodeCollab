import "./App.css";
// import Editor from "./components/Editor";
// import UserInputOutput from "./components/UserInputOutput";
// import { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import NavbarComponent from "./components/Navbar";
function App() {
  return (
    <div className="App">
      <NavbarComponent />
      <CodeEditor />
    </div>
  );
}

export default App;
