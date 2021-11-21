import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { MovieProps } from './MovieProps';

const movieUrl = `http://${baseUrl}/api/movies`;


export const getMovies: (token: string) => Promise<MovieProps[]> = token => {
    //console.log('TOKEN: ',token);
    return withLogs(axios.get(movieUrl, authConfig(token)), 'getMovies');
}

export const createMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token,movie) => {
    //console.log('TOKEN 2: ',token);
    return withLogs(axios.post(movieUrl, movie, authConfig(token)), 'createMovie');
}

export const updateMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token, movie) => {
    return withLogs(axios.put(`${movieUrl}/${movie._id}`, movie, authConfig(token)), 'updateMovie');
}

export const deleteMovie: (token: string, movie: MovieProps) => Promise<MovieProps[]> = (token,movie) => {
    return withLogs(axios.delete(`${movieUrl}/${movie._id}`, authConfig(token)), 'deleteMovie');
}


interface MessageData {
    event: string;
    payload: MovieProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
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
