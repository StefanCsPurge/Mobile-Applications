import axios from 'axios';
import { config, baseUrl, getLogger, withLogs } from '../core';
import { MessageProps } from '../messages/MessageProps';

const movieUrl = `http://${baseUrl}/message`;


export const getMessages: () => Promise<MessageProps[]> = () => {
    return withLogs(axios.get(movieUrl, config), 'getMessages');
}

export const updateMessage: (msg: MessageProps) => Promise<MessageProps> = (msg) => {
    return withLogs(axios.put(`${movieUrl}/${msg.id}`, msg, config), 'updateMessage');
}

// interface MessageData {
//     event: string;
//     payload: MessageProps;
// }

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: MessageProps) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        // ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}