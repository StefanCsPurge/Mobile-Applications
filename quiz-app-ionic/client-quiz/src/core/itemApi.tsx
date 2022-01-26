import axios from 'axios';
import { config, baseUrl, getLogger, withLogs } from '../core';
import { ItemProps } from '../items/ItemProps';

const assUrl = `http://${baseUrl}`;


export const getQuestion: (id: number) => Promise<ItemProps> = (id) => {
    return withLogs(axios.get(`${assUrl}/question/${id}`, config), 'getItem');
}

// export const createItem: (ass: ItemProps) => Promise<ItemProps> = (ass) => {
//     return withLogs(axios.post(`${assUrl}`, ass, config), 'createItem');
// }

export const authenticate: (tid: string) => Promise<any> = (tid) => {
    return withLogs(axios.post(`${assUrl}/auth`, {id: tid}, config), 'authenticate id');
}

// interface MessageData {
//     event: string;
//     payload: ItemProps;
// }

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: ItemProps) => void) => {
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