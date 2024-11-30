import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import {ACTIONS} from "../Actions";


const Editor = ({socketRef,roomId,onCodeChange}) => {
    const editorRef =useRef(null);
    useEffect(() =>{
        const init = async() =>{
            const editor = CodeMirror.fromTextArea(
               document.getElementById("realTimeEditor"),
                {
                    mode:{name:"javascript", json:true},
                    theme:"dracula",
                    autoCloseTags:true,
                    autoCloseBrackets:true,
                    lineNumbers:true,

                }
            );

            //for sync the code
            editorRef.current =editor;


            editor.setSize(null,"100%");
            editorRef.current.on('change', (instance,changes) => {
               // console.log('changes',instance,changes);
               const{origin} = changes;
               const code = instance.getValue();
               onCodeChange(code);


               if(origin !== 'setValue'){
                socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                    roomId,
                    code,
                });
               }
            });
           
        };

        init();
    }, [onCodeChange, roomId, socketRef]);

    //DATA receiving from server
    useEffect(() => {
        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) =>{
                if(code !== null){
                    editorRef.current.setValue(code);
                }
            });
        }
        return() =>{
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }
    },[socketRef.current]);

  return (
    <div style={{height:"600%"}}>
    <textarea id="realTimeEditor"></textarea>
    </div>
  )
}

export default Editor