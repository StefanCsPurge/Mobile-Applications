import axios from 'axios';
import { config, baseUrl, getLogger, withLogs } from '../core';
import { AssetProps } from '../assets/AssetProps';

const assUrl = `http://${baseUrl}/asset`;


export const getUserAssets: (user: string) => Promise<AssetProps[]> = (user) => {
    return withLogs(axios.get(`${assUrl}?postBy=${user}`, config), 'getUserAssets');
}

export const createAsset: (ass: AssetProps) => Promise<AssetProps> = (ass) => {
    return withLogs(axios.post(`${assUrl}`, ass, config), 'createAsset');
}

export const updateAssetStatus: (ass: AssetProps) => Promise<AssetProps> = (ass) => {
    return withLogs(axios.patch(`${assUrl}/${ass.id}`, {status: ass.status}, config), 'updateAssetStatus');
}

export const updateAssetBorrowers: (ass: AssetProps) => Promise<AssetProps> = (ass) => {
    return withLogs(axios.patch(`${assUrl}/${ass.id}`, {borrowers: ass.borrowers}, config), 'updateAssetBorrowers');
}

export const getActiveAssets: () => Promise<AssetProps[]> = () => {
    return withLogs(axios.get(`${assUrl}?status=active`, config), 'getActiveAssets');
}

// interface MessageData {
//     event: string;
//     payload: AssetProps;
// }

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: AssetProps) => void) => {
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