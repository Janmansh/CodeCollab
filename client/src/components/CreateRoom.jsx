import React from 'react';
import { useNavigate } from "react-router-dom";

function CreateRoom(props) {

    let navigate = useNavigate();

    const create = async (e) => {
        e.preventDefault()

        const resp = await fetch("http://localhost:8080/create");
        const { roomId } = await resp.json(); 
        
        navigate(`/room/${roomId}`)
    }

    return ( 
        <div>
            <button onClick={create}>Create Room</button>
        </div>
     );
}

export default CreateRoom;