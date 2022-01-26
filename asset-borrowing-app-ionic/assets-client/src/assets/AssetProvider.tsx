import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { AssetProps } from './AssetProps';
import {newWebSocket, createAsset, getUserAssets, updateAssetStatus, getActiveAssets, updateAssetBorrowers} from '../core/itemApi';
import { useNetwork } from "../core/useNetwork";
import { Storage } from '@capacitor/storage';
import { useIonToast } from '@ionic/react';

const log = getLogger('AssetProvider');

type SaveAssFn = (msg: { id?: number; name: string; postBy: string; borrowers?: string[]; status?: string }) => Promise<any>;

export interface AssetsState {
    assets?: AssetProps[],
    activeAssets?: AssetProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    createAss?: SaveAssFn,
    borrowAss?: SaveAssFn,
    startFilter?: (n: number) => void,
    username: string,
    setUsername?: (username?: string) => void,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: AssetsState = {
    fetching: false,
    saving: false,
    username: ''
};

const FETCH_ASS_STARTED = 'FETCH_ASS_STARTED';
const FETCH_ASS_SUCCEEDED = 'FETCH_ASS_SUCCEEDED';
const FETCH_ACTIVE_ASS_SUCCEEDED = 'FETCH_ACTIVE_ASS_SUCCEEDED';
const FETCH_ASS_FAILED = 'FETCH_ASS_FAILED';
const SAVE_ASS_STARTED = 'SAVE_ASS_STARTED';
const SAVE_ASS_SUCCEEDED = 'SAVE_ASS_SUCCEEDED';
const SAVE_ACTIVE_ASS_SUCCEEDED = 'SAVE_ACTIVE_ASS_SUCCEEDED';
const SAVE_ASS_FAILED = 'SAVE_ASS_FAILED';
const SET_USERNAME = 'SET_USERNAME';

const reducer: (state: AssetsState, action: ActionProps) => AssetsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ASS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ASS_SUCCEEDED:
                Storage.set({key: 'assets', value: JSON.stringify(payload.assets)}).then();
                return { ...state, assets: payload.assets, fetching: false };
            case FETCH_ACTIVE_ASS_SUCCEEDED:
                return { ...state, activeAssets: payload.activeAssets, fetching: false };
            case FETCH_ASS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ASS_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ASS_SUCCEEDED:
                const assets = [...(state.assets || [])]; // add assets and spread them - avoid reference
                const ass = payload.ass;
                const index = assets.findIndex(m => m.id === ass.id);
                if (index === -1) {
                    assets.splice(0, 0, ass);
                } else {
                    assets[index] = ass;
                }
                Storage.set({key: 'assets', value: JSON.stringify(assets)}).then();
                return { ...state, assets, saving: false };
            case SAVE_ACTIVE_ASS_SUCCEEDED:
                const activeAssets = [...(state.activeAssets || [])]; // add assets and spread them - avoid reference
                const actAss = payload.ass;
                const idx = activeAssets.findIndex(a => a.id === actAss.id);
                if (idx === -1 && actAss.status === 'active') {
                    activeAssets.splice(0, 0, actAss);
                } else {
                    if(actAss.status === 'inactive')
                        activeAssets.splice(idx,1);
                    else
                        activeAssets[idx] = actAss;
                }
                return { ...state, activeAssets, saving: false };
            case SAVE_ASS_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case SET_USERNAME:
                return {...state, username: payload.username};
            default:
                return state;
        }
    };

export const AssetContext = React.createContext<AssetsState>(initialState);

interface AssetProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
    const { networkStatus } = useNetwork();
    const [present] = useIonToast();
    useEffect(retryUpdateEffect, [networkStatus.connected]);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { assets, activeAssets, fetching, fetchingError, saving, savingError, username} = state;
    useEffect(getAssetsEffect, [networkStatus.connected, username]);  // [] = use only once after the component is rendered
    useEffect(getActiveAssetsEffect, [username]);
    useEffect(wsEffect, [networkStatus.connected]);
    const createAss = useCallback<SaveAssFn>(saveAssCallback, []);
    const borrowAss = useCallback<SaveAssFn>(borrowAssCallback, []);
    const setUsername = useCallback<(username?: string) => void>(setUsernameCallback, []);
    const value = { assets, activeAssets, fetching, fetchingError, createAss, borrowAss, saving, savingError, username, setUsername};

    //log('returns');
    return (
        <AssetContext.Provider value={value}>
            {children}
        </AssetContext.Provider>
    );

    function setUsernameCallback(username?: string): void {
        dispatch({ type: SET_USERNAME, payload: { username } });
    }

    function retryUpdateEffect() {
        if(networkStatus.connected) {
            retryUpdate().then();
        }
        async function retryUpdate() {
            const v2 = await Storage.get({key: 'ass_to_retry'});
            if(!v2.value) return;
            let ass_to_retry: AssetProps[] = JSON.parse(v2.value!);
            await Storage.set({key: 'ass_to_retry', value: JSON.stringify([])});
            for(let idx in ass_to_retry)
                  await createAss(ass_to_retry[idx]);
        }
    }

    function getAssetsEffect() {
        let canceled = false;
        fetchAssets().then();
        return () => {
            canceled = true;
        }

        async function fetchAssets() {
            try {
                log('fetchAssets started');
                dispatch({ type: FETCH_ASS_STARTED });

                const {value} = await Storage.get({key: 'username'});
                if(value){
                    const all_assets = await getUserAssets(value!);
                    log('fetchAssets succeeded');
                    if (!canceled) {
                        dispatch({ type: FETCH_ASS_SUCCEEDED, payload: { assets: all_assets } });
                    }
                }
            } catch (error) {
                log('fetchAssets failed');
                const {value} = await Storage.get({key: 'assets'});
                if (!networkStatus.connected && value) {
                    const saved_assets: AssetProps[] = JSON.parse(value);
                    if (!canceled) {
                        dispatch({ type: FETCH_ASS_SUCCEEDED, payload: { assets: saved_assets } });
                    }
                }
                else dispatch({ type: FETCH_ASS_FAILED, payload: { error } });
            }
        }
    }

    function getActiveAssetsEffect() {
        let canceled = false;
        fetchActiveAssets().then();
        return () => {
            canceled = true;
        }

        async function fetchActiveAssets() {
            try {
                log('fetchActiveAssets started');
                dispatch({ type: FETCH_ASS_STARTED });
                const all_assets = await getActiveAssets();
                log('fetchActiveAssets succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ACTIVE_ASS_SUCCEEDED, payload: { activeAssets: all_assets } });
                }
            } catch (error) {
                log('fetchActiveAssets failed');
                dispatch({ type: FETCH_ASS_FAILED, payload: { error } });
            }
        }
    }

    async function saveAssCallback(ass: AssetProps) {
        try {
            log('saveMessage started');
            dispatch({ type: SAVE_ASS_STARTED });
            const savedAss = ass.id ? await updateAssetStatus(ass) : await createAsset(ass);
            log('saveMessage succeeded');

            dispatch({ type: SAVE_ASS_SUCCEEDED, payload: { ass: savedAss } });
        } catch (error) {
            log('saveMsg failed');
            const {value} = await Storage.get({key: 'assets'});
            if (!networkStatus.connected && value) {
                if (!ass.id){
                    dispatch({ type: SAVE_ASS_FAILED, payload: {}});
                    present({
                        buttons: [{text: 'retry', handler: () => saveAssCallback(ass)}, { text: 'dismiss' }],
                        message: 'Asset creation failed because you are offline',
                        onDidDismiss: () => console.log('dismissed'),
                    }).then();
                }

                else {
                    const v = await Storage.get({key: 'ass_to_retry'});
                    if(!v.value) await Storage.set({key: 'ass_to_retry', value: JSON.stringify([])});

                    const {value} = await Storage.get({key: 'ass_to_retry'});
                    let ass_to_retry: AssetProps[] = JSON.parse(value!);
                    const idx = ass_to_retry.findIndex(a => a.id === ass.id);
                    if(idx && idx !== -1)
                        ass_to_retry[idx].status = ass.status;
                    else if (ass.id)
                        ass_to_retry.push(ass);
                    await Storage.set({
                        key: 'ass_to_retry',
                        value: JSON.stringify(ass_to_retry)
                    });
                    dispatch({ type: SAVE_ASS_SUCCEEDED, payload: { ass } }); // update locally
                }

            }
            else dispatch({ type: SAVE_ASS_FAILED, payload: { error } });
        }
    }

    async function borrowAssCallback(ass: AssetProps) {
        try {
            log('borrow asset started');
            dispatch({ type: SAVE_ASS_STARTED });
            const savedAss = await updateAssetBorrowers(ass);
            log('borrow asset succeeded');
            dispatch({ type: SAVE_ACTIVE_ASS_SUCCEEDED, payload: { ass: savedAss } });
        } catch (error) {
            log('borrow asset failed');
            dispatch({ type: SAVE_ASS_FAILED, payload: { error }});
            present({
                buttons: [{text: 'retry', handler: () => borrowAssCallback(ass)}, { text: 'dismiss' }],
                message: 'Asset update failed.',
                onDidDismiss: () => console.log('dismissed'),
            }).then();
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const ass  = message;
            log(`ws message, ass: ${ass.id}`);
            present({
                message: `Asset ${ass.id} was modified - name: ${ass.name}, posted by: ${ass.postBy}, borrowers: [${ass.borrowers}], status: ${ass.status}.`,
                duration: 3000
            }).then();

            if(ass.postBy === username)
                dispatch({ type: SAVE_ASS_SUCCEEDED, payload: { ass } });
            else dispatch({ type: SAVE_ACTIVE_ASS_SUCCEEDED, payload: { ass } });
        });
        return () => {   // in case the component is unmounted
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
