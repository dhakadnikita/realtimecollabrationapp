import {io} from "socket.io-client";

export const initSocket = async() =>{
    const option = {
        'force new connecetion ': true,
        reconnectionAttempt:"infinity",
        timeout:10000,
        transports:['websocket'],
    };
    return io(process.env.REACT_APP_BACKENED_URL, option);
};