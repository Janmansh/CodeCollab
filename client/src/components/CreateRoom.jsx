import React from 'react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import './CreateRoom.css';

function CreateRoom(props) {

    let navigate = useNavigate();

    const [value, setValue] = useState()

    const join = async (e) => {
        if(value)
            navigate(`/room/${value}`);
    }

    const create = async (e) => {
        e.preventDefault()

        const resp = await fetch("http://localhost:8080/create");
        const { roomId } = await resp.json(); 
        
        navigate(`/room/${roomId}`)
    }

    return ( 
        <div className="createRoom">
            <div className="container">
                <h1 className="mainHeading">Code Collab</h1>
                <div className="crbDiv"><button id="createButton" onClick={create}>Create Room</button></div>
                <div className="joiner">
                    <input type="text" name="roomInp" placeholder="room id" id="roomInp" value={value} onChange={(e) => setValue(e.target.value)}/>
                    <button id="joinButton" onClick={join}>Join</button>
                </div>
            </div>
        </div>
     );
}

export default CreateRoom;