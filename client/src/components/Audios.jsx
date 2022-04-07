import React from 'react';

function getTags(streams) {
    const tags = [];
    console.log("In AUdio", streams);

    for (let i = 0; i < streams.arr.length; i++) {
        tags.push(<audio autoPlay={true} controls={true} ref={audio => {audio.srcObject = streams.arr[i] }}></audio>);        
    }

    return tags;
}

function Audios(props) {
    console.log(props);
    return (
        <>
        {getTags(props.streams)}
        </>
     );
}

export default Audios;