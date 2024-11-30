import React, {useEffect, useRef, useState } from 'react'
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from '../socket';
import {ACTIONS} from "../Actions";
import {useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";

import {toast} from 'react-hot-toast';
//import axios from "axios";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];


const EditorPage = () => {
  const [clients, setClient]= useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  


  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const Location = useLocation();
  const {roomId} = useParams();
  const navigate = useNavigate();
  useEffect(() =>{
    const init = async()=>{
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error',(err) => handleError(err));
      socketRef.current.on('connect_failed',(err) => handleError(err));
      
      const handleError=(err) =>{
        console.log('Error=>',err);
        toast.error('socket connection failed,Try again later');
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN,{
        roomId,
        username:Location.state?.username,

      });
      socketRef.current.on(ACTIONS.JOINED,
        ({clients, username, socketId}) =>{
        if(username !== Location.state?.username){
          toast.success(`${username} joined the room.`);
        }
        setClient(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE,{
          code:codeRef.current,
          socketId,
      });
      });

      //disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username,}) =>{
        toast.success(`${username} leave`);
        setClient((prev) =>{
          return prev.filter(
            (client) => client.socketId !== socketId);
        })
      });
    };
    
    init();

    return () =>{
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    }
  },[Location.state?.username, navigate, roomId]);
  

  if(!Location.state){
    return <Navigate to="/" />;
  }

  const copyRoomId = async () =>{
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success("roomId id copied")
    }catch(error){
        toast.error("unable to copy roomId")
      }
  }

  const leaveRoom = () =>{
    navigate("/");
  }


  return (
    <div className="container-fluid vh-100 d-flex-column">
        <div className="row flex-grow-1">
            <div className="col-md-2 bg-dark text-light d-flex flex-column h-100"
             style={{boxShadow:"2px 0px 4px rgba(0,0,0,0.1"}}
             >
                <img src="/image/Coding.png"
                 alt="CodeCast" className="img-fluid mx-auto"
                  style={{maxWidth:'150px', marginTop:"-40px"}}
                  />
                <hr style={{marginTop:"-1rem"}}/>

                {/*client list container*/}
                <div className="d-flex flex-colun overflow-auto">
                  {clients.map((client) =>(
                    <Client key={client.socketId} 
                    username={client.username}
                    />

                  ))}
                </div>
                {/*button*/}
                <div className="mt-auto">
                  <hr/>
                  <button onClick={copyRoomId} className="btn btn-success">Copy Room Id</button>
                  <button onClick={leaveRoom} className="btn btn-danger mt-2 mb-2 px-3 btn-block">Leave Room</button>
                </div>
            </div>
            <div className="col-md-10 text-light d-flex-column h-100">
               <Editor socketRef = {socketRef} 
               roomId={roomId} 
               onCodeChange={(code) =>
                codeRef.current=code}/>
            </div>
        </div>
    </div>
  )
}

export default EditorPage
