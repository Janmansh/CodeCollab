import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
// import Editor from "./components/Editor";
// import UserInputOutput from "./components/UserInputOutput";
// import { useState } from "react";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CreateRoom />}></Route>
                    <Route path="/room/:roomId" element={<Room />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
