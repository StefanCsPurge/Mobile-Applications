import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MessageProps } from './MessageProps';
import { getMessages, newWebSocket, updateMessage } from '../core/messagesApi';
import { useNetwork } from "../core/useNetwork";
import { Storage } from '@capacitor/storage';
import {UserProps} from "./UserProps";

const log = getLogger('MessageProvider');

type SaveMsgFn = (msg: { id?: number; text: string; read: boolean; sender: string; created: number }) => Promise<any>;

export interface MessagesState {
    messages?: MessageProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveMsg?: SaveMsgFn,
    startFilter?: (n: number) => void,
    users?: UserProps[],
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: MessagesState = {
    fetching: false,
    saving: false,
};

const FETCH_MSG_STARTED = 'FETCH_MSG_STARTED';
const FETCH_MSG_SUCCEEDED = 'FETCH_MSG_SUCCEEDED';
const FETCH_MSG_FAILED = 'FETCH_MSG_FAILED';
const SAVE_MSG_STARTED = 'SAVE_MSG_STARTED';
const SAVE_MSG_SUCCEEDED = 'SAVE_MSG_SUCCEEDED';
const SAVE_MSG_FAILED = 'SAVE_MSG_FAILED';

const reducer: (state: MessagesState, action: ActionProps) => MessagesState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_MSG_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_MSG_SUCCEEDED:
                Storage.set({key: 'messages', value: JSON.stringify(payload.messages)}).then();
                return { ...state, messages: payload.messages, users: payload.users, fetching: false };
            case FETCH_MSG_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_MSG_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_MSG_SUCCEEDED:
                const messages = [...(state.messages || [])]; // add messages and spread them - avoid reference
                const msg = payload.msg;
                const index = messages.findIndex(m => m.id === msg.id);
                if (index === -1) {
                    messages.splice(0, 0, msg);
                } else {
                    messages[index] = msg;
                }
                Storage.set({key: 'messages', value: JSON.stringify(messages)}).then();
                const users = getUsersFromMessages(messages);
                return { ...state, messages, users, saving: false };
            case SAVE_MSG_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const MessageContext = React.createContext<MessagesState>(initialState);

interface MsgProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const MsgProvider: React.FC<MsgProviderProps> = ({ children }) => {
    const { networkStatus } = useNetwork();
    useEffect(retryUpdateEffect, [networkStatus.connected]);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { messages, fetching, fetchingError, saving, savingError, users } = state;
    useEffect(getMessagesEffect, [networkStatus.connected]);  // [] = use only once after the component is rendered
    useEffect(wsEffect, [networkStatus.connected]);
    const saveMsg = useCallback<SaveMsgFn>(saveMsgCallback, []);
    const value = { messages, fetching, fetchingError, saving, savingError, saveMsg, users };
    //log('returns');
    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );

    function retryUpdateEffect(){
        if(networkStatus.connected) {
            retryUpdate().then();
        }
        async function retryUpdate() {
            const v2 = await Storage.get({key: 'msg_to_update'});
            if(!v2.value) return;
            let msg_to_update: MessageProps[] = JSON.parse(v2.value!);
            await Storage.set({key: 'msg_to_update', value: JSON.stringify([])});
            for(let idx in msg_to_update){
                await saveMsg(msg_to_update[idx]);
            }
        }
    }

    function getMessagesEffect() {
        let canceled = false;
        fetchMessages().then();
        return () => {
            canceled = true;
        }

        async function fetchMessages() {
            try {
                log('fetchMessages started');
                dispatch({ type: FETCH_MSG_STARTED });
                const all_messages = await getMessages();
                // get users here
                let users = getUsersFromMessages(all_messages);
                let messages: MessageProps[];
                messages = all_messages;
                log('fetchMessages succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_MSG_SUCCEEDED, payload: { messages, users } });
                }
            } catch (error) {
                log('fetchMessages failed');
                const {value} = await Storage.get({key: 'messages'});
                if (!networkStatus.connected && value) {
                    const saved_messages: MessageProps[] = JSON.parse(value);
                    const saved_users = getUsersFromMessages(saved_messages);
                    if (!canceled) {
                        dispatch({ type: FETCH_MSG_SUCCEEDED, payload: { messages: saved_messages, users: saved_users } });
                    }
                }
                else dispatch({ type: FETCH_MSG_FAILED, payload: { error } });
            }
        }
    }

    async function saveMsgCallback(msg: MessageProps) {
        try {
            log('saveMessage started');
            dispatch({ type: SAVE_MSG_STARTED });

            const savedMsg = await updateMessage(msg);
            log('saveMessage succeeded');

            dispatch({ type: SAVE_MSG_SUCCEEDED, payload: { msg: savedMsg } });
        } catch (error) {
            log('saveMsg failed');
            const {value} = await Storage.get({key: 'messages'});
            if (!networkStatus.connected && value) {
                console.log("HERE");
                const v = await Storage.get({key: 'msg_to_update'});
                if(!v.value) await Storage.set({key: 'msg_to_update', value: JSON.stringify([])});

                const {value} = await Storage.get({key: 'msg_to_update'});
                let msg_to_update: MessageProps[] = JSON.parse(value!);
                msg_to_update.push(msg);
                await Storage.set({
                    key: 'msg_to_update',
                    value: JSON.stringify(msg_to_update)
                });
                dispatch({ type: SAVE_MSG_SUCCEEDED, payload: { msg } }); // update locally
            }
            else dispatch({ type: SAVE_MSG_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const msg  = message;
            log(`ws message, msg read: ${msg.read}`);
            dispatch({ type: SAVE_MSG_SUCCEEDED, payload: { msg } });
        });
        return () => {   // in case the component is unmounted
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};

function getUsersFromMessages(messages: MessageProps[]): UserProps[] {
    let users: UserProps[] = [];
    for(let i = 0; i < messages.length; i++)
    {
        const index = users.findIndex(u => u.name === messages[i].sender);
        if (index === -1){
            if(!messages[i].read)
                users.push({name: messages[i].sender, unreadCount: 1, lastUnreadTime: messages[i].created});
            else users.push({name: messages[i].sender, unreadCount: 0, lastUnreadTime: 0});
        }
        else if(!messages[i].read){
            users[index].unreadCount++;
            if(messages[i].created > users[index].lastUnreadTime)
                users[index].lastUnreadTime = messages[i].created;
        }
    }
    users.sort((one, two) => (one.lastUnreadTime > two.lastUnreadTime ? -1 : 1));
    return users;
}
