import React from 'react';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import * as Automerge from 'automerge';

import CodeEditor from "./CodeEditor";
import NavbarComponent from "./Navbar";
import { useState } from 'react';

function Room() {
    let { roomId } = useParams();
    
    const userAudio = useRef();
    const userStream = useRef();
    const partnerAudio = useRef();
    const peerRef = useRef();
    const webSocketRef = useRef();

    const [codeC, setCodeC] = useState("");

    const doc = useRef(Automerge.init());

    const handleChange = (e) => {
        setCodeC(e);

        let newDoc = Automerge.change(doc.current, (doc) => {
            doc.code = e;
        });

        doc.current = newDoc;
    };

    const openMic = async () => {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const mics = allDevices.filter((device) => device.kind === "audioinput");

        // TODO add input device option
        // media device can be changed by changing the array index. 
        const constraints = {
            audio: {
                deviceId: mics[0].deviceId
            }
        }

        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        openMic().then((stream) => {
            userAudio.current.srcObject = stream;
            userStream.current = stream;
        })

        webSocketRef.current = new WebSocket(`ws://localhost:8080/join?roomId=${roomId}`);

        webSocketRef.current.addEventListener("open", () => {
            webSocketRef.current.send(JSON.stringify({ join: true }));
        });

        webSocketRef.current.addEventListener("message", async (e) => {
            const message = JSON.parse(e.data);

            if(message.join) {
                callUser();
            }
            
            if(message.offer) {
                console.log("Recieved offer");
                handleOffer(message.offer);
            }

            if(message.answer) {
                console.log("Received answer");
                peerRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
            }

            if(message.iceCandidate) {
                console.log("Recieving and adding ICE Candidate");
                try {
                    await peerRef.current.addIceCandidate(message.iceCandidate);
                } catch (err) {
                    console.log("Error adding ICE Candidate: ", err);
                }
            }

            if(message.changes) {
                const ar = Uint8Array.from(message.changes.split(',').map(x => Number(x)));
                console.log("Recieved doc: ", message.changes, ": - ", ar);

                let newDoc = Automerge.load(ar);

                doc.current = Automerge.merge(doc.current, newDoc);

                setCodeC(doc.current.code);
            }
        });

        setInterval(sendDoc, 3000);

    }, []);

    const sendDoc = () => {
        let changes = Automerge.save(doc.current)

        console.log(changes);

        webSocketRef.current.send(JSON.stringify({ changes: String(changes) }));
    };

    const handleOffer = async (offer) => {
        console.log("Creating answer");
        peerRef.current = createPeer();

        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));

        userStream.current.getTracks().forEach(track => {
            peerRef.current.addTrack(track, userStream.current);
        });

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);

        webSocketRef.current.send(JSON.stringify({ answer }));
    }

    const callUser = () => {
        console.log("WebRTC connnecting latest joinee");
        peerRef.current = createPeer();

        userStream.current.getTracks().forEach(track => {
            peerRef.current.addTrack(track, userStream.current);
        });
    };

    const createPeer = () => {
        console.log("Creating P2P Conn");
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        peer.onnegotiationneeded = handleNegotiationNeeded;
        peer.onicecandidate = handleIceCandidateEven;
        peer.ontrack = handleTrackEvent;

        return peer;
    };

    const handleNegotiationNeeded = async () => {
        console.log("Creating offer");

        try {
            const myOffer = await peerRef.current.createOffer();
            await peerRef.current.setLocalDescription(myOffer);

            webSocketRef.current.send(JSON.stringify({ offer: myOffer }));
            
        } catch (err) {
            console.log("Error during offer creation: ", err);
        }
    }

    const handleIceCandidateEven = (e) => {
        console.log("Found ICE Candidate");
        if(e.candidate) {
            console.log(e.candidate);
            webSocketRef.current.send(JSON.stringify({iceCandidate: e.candidate}));
        }
    }

    const handleTrackEvent = (e) => {
        console.log("Recieved tracks");
        partnerAudio.current.srcObject = e.streams[0]
    }

    return ( 
        <>
        <div>
            <NavbarComponent />
            <CodeEditor vl={codeC} hcg={handleChange}/>
        </div>
        <div>
            <audio autoPlay={true} controls={true} ref={userAudio}></audio>
            <audio autoPlay={true} controls={true} ref={partnerAudio}></audio>
        </div>
        </>
     );
}

export default Room;