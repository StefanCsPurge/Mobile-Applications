import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import {newWebSocket, getQuestion, authenticate} from '../core/itemApi';
import { useNetwork } from "../core/useNetwork";
import { Storage } from '@capacitor/storage';
import { useIonToast } from '@ionic/react';

const log = getLogger('ItemProvider');

type SaveItemFn = (msg: { id?: number; name: string; borrowers?: string[]; status?: string }) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    questionIds?: number[],
    fetching: boolean,
    downloaded: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
    token: string,
    setToken?: (token?: string) => void,
    authenticateUser?: (token: string) => void,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    items: [],
    questionIds: [],
    fetching: false,
    saving: false,
    token: '',
    downloaded: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEM_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEM_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEM_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const SET_TOKEN = 'SET_TOKEN';
const SAVE_QUESTION_SUCCEEDED = 'SAVE_QUESTION_SUCCEEDED';
const SKIP_DOWNLOAD = 'SKIP_DOWNLOAD';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, fetching: false, downloaded: true };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false, downloaded: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                const token = payload.token;
                const questionIds = payload.questionIds;
                Storage.set({key: 'questionIds', value: JSON.stringify(payload.questionIds)}).then();
                Storage.set({key: 'token', value: payload.token}).then();
                return { ...state, token, questionIds, saving: false };
            case SAVE_QUESTION_SUCCEEDED:
                const items = [...(state.items || [])]; // add assets and spread them - avoid reference
                const it = payload.question;
                const index = items.findIndex(m => m.id === it.id);
                if (index === -1) items.splice(0, 0, it);
                else items[index] = it;
                Storage.set({key: 'items', value: JSON.stringify(items)}).then();
                return { ...state, items };
            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case SET_TOKEN:
                if(payload.token === '') return initialState;
                return {...state, token: payload.token};
            case SKIP_DOWNLOAD:
                return {... state, downloaded: true, token: payload.token, items: payload.items, questionIds: payload.questionIds};
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
    const { networkStatus } = useNetwork();
    const [present] = useIonToast();
    useEffect(trySkipLogin, []);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError, token, questionIds, downloaded} = state;
    useEffect(getItemsEffect, [questionIds]);  // [] = use only once after the component is rendered
    useEffect(wsEffect, [networkStatus.connected]);
    const setToken = useCallback<(token?: string) => void>(setTokenCallback, []);
    const authenticateUser = useCallback<(token: string) => void>(authenticateCallback, []);
    const value = { items, fetching, fetchingError, saving, savingError, token, setToken, authenticateUser, questionIds, downloaded};

    //log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function setTokenCallback(token?: string): void {
        dispatch({ type: SET_TOKEN, payload: { token } });
    }

    function trySkipLogin() {
        skipLogin().then();
        async function skipLogin() {
            const v1 = await Storage.get({key: 'token'});
            const v2 = await Storage.get({key: 'questionIds'});
            const v3 = await Storage.get({key: 'items'});
            if(!v1.value || !v2.value || !v3.value) return;
            //console.log("SKIP",v1.value,v2.value,v3.value);
            const token = v1.value;
            const questionIds: number[] = JSON.parse(v2.value);
            const items: ItemProps[] = JSON.parse(v3.value);
            if(questionIds.length > items.length) return;
            dispatch({type: SKIP_DOWNLOAD, payload: {token,questionIds,items}});
        }
    }

    function getItemsEffect() {
        let canceled = false;
        if(questionIds && questionIds.length > 0){
            fetchItems(0).then();
        }

        return () => {
            canceled = true;
        }

        async function fetchItems(startIdx: number) {
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                //const {value} = await Storage.get({key: 'username'});
                let question: ItemProps;
                for(let i = startIdx; i < questionIds!.length; i++)
                {
                    try {
                        question = await getQuestion(questionIds![i]);
                        dispatch({ type: SAVE_QUESTION_SUCCEEDED, payload: { question } });
                    }
                    catch (e) {
                        present({
                            buttons: [{text: 'retry', handler: () => fetchItems(i)}, { text: 'dismiss' }],
                            message: `Download failed at question ${i}`,
                            color: "warning",
                            onDidDismiss: () => console.log('dismissed'),
                        }).then();
                        return;
                    }

                }
                log('fetchItems succeeded');
                dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
            } catch (error) {
                log('fetchItems failed');
                const {value} = await Storage.get({key: 'items'});
                if (!networkStatus.connected && value) {
                    // const saved_items: ItemProps[] = JSON.parse(value);
                    // if (!canceled) {
                    //     dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { assets: saved_items } });
                    // }
                }
                else dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }

    async function authenticateCallback(tid: string) {
        try {
            log('authentication started');
            dispatch({ type: SAVE_ITEM_STARTED });
            const {token, questionIds} = await authenticate(tid);
            log('authentication succeeded');
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { token, questionIds } });
        } catch (error) {
            log('authentication failed');
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const item  = message;
            log(`ws message, item: ${item.id}`);
            present({
                message: `A new question was added: "${item.text}", with options: ${item.options}`,
                duration: 2500
            }).then();
            //dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
        });
        return () => {   // in case the component is unmounted
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
