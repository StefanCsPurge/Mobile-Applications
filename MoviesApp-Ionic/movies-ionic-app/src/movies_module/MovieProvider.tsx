import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { MovieProps } from './MovieProps';
import { createMovie, getMovies, newWebSocket, updateMovie, deleteMovie } from './movieApi';
import { AuthContext } from '../auth';
import {useNetwork} from "../core/useNetwork";
import { Storage } from '@capacitor/storage';
import {Photo} from "../core/usePhotoCamera";

const log = getLogger('MovieProvider');

type SaveMovieFn = (movie: {  _id?: string; title: string; year: number; photo?: Photo; location?: any}) => Promise<any>;

export interface MoviesState {
    movies?: MovieProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveMovie?: SaveMovieFn,
    deleting: boolean,
    deletingError?: Error | null,
    delMovie?: SaveMovieFn,
    startFilter?: (n: number) => void,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: MoviesState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';
const DELETE_MOVIE_STARTED = 'DELETE_MOVIE_STARTED';
const DELETE_MOVIE_SUCCEEDED = 'DELETE_MOVIE_SUCCEEDED';
const DELETE_MOVIE_FAILED = 'DELETE_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_MOVIES_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_MOVIES_SUCCEEDED:
                return { ...state, movies: payload.movies, fetching: false };
            case FETCH_MOVIES_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_MOVIE_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_MOVIE_SUCCEEDED:
                const movies = [...(state.movies || [])]; // add movies and spread them - avoid reference
                const movie = payload.movie;
                const index = movies.findIndex(m => m._id === movie._id);
                if (index === -1) {
                    movies.splice(0, 0, movie);
                } else {
                    movies[index] = movie;
                }
                return { ...state, movies, saving: false };
            case SAVE_MOVIE_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case DELETE_MOVIE_STARTED:
                return { ...state, deletingError: null, deleting: true };
            case DELETE_MOVIE_SUCCEEDED:
            {
                const movies = [...(state.movies || [])];
                const deleted_movie = payload.movie;
                const index2 = movies.findIndex(m => m._id === deleted_movie._id);
                movies.splice(index2, 1);
                return { ...state, movies, deleting: false };
            }
            case DELETE_MOVIE_FAILED:
                return { ...state, deletingError: payload.error, deleting: false };
            default:
                return state;
        }
    };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
    const { token, isAuthenticated } = useContext(AuthContext);
    const { networkStatus } = useNetwork();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { movies, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
    const [filter, setFilter] = useState<number | undefined>(undefined);
    useEffect(getMoviesEffect, [isAuthenticated, filter]);  // [] = use only once after the component is rendered
    useEffect(wsEffect, [isAuthenticated]);
    const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, [isAuthenticated]);
    const delMovie = useCallback<SaveMovieFn>(deleteMovieCallback, [isAuthenticated]);
    const startFilter = useCallback<(n: number) => void>(filterCallback, []);
    const value = { movies, fetching, fetchingError, saving, savingError, saveMovie, deleting, deletingError, delMovie, startFilter };
    log('returns');
    return (
        <MovieContext.Provider value={value}>
            {children}
        </MovieContext.Provider>
    );

    function filterCallback(n: number): void {
        log('filter');
        setFilter(n);
    }

    function getMoviesEffect() {
        let canceled = false;
        fetchMovies().then();
        return () => {
            canceled = true;
        }

        async function fetchMovies() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchMovies started');
                dispatch({ type: FETCH_MOVIES_STARTED });
                const all_movies = await getMovies(token);
                let movies: MovieProps[] = [];
                if (filter && filter != 420){
                    for (let m of all_movies)
                        if ((filter === 1 && m.year < 2010) || (filter === 2010 && m.year >= 2010))
                            movies.push(m)
                }
                else movies = all_movies;
                log('fetchMovies succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies } });
                }
            } catch (error) {
                log('fetchMovies failed');
                dispatch({ type: FETCH_MOVIES_FAILED, payload: { error } });
            }
        }
    }

    async function saveMovieCallback(movie: MovieProps) {
        try {
            log('saveMovie started');
            dispatch({ type: SAVE_MOVIE_STARTED });
            const savedMovie = await (movie._id ? updateMovie(token,movie) : createMovie(token,movie));
            log('saveMovie succeeded');
            dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie: savedMovie } });
        } catch (error) {
            log('saveMovie failed');
            if (networkStatus.connected) {
                const operation = movie._id ? 'Update' : 'Create';
                window.alert(operation + ' movie operation failed because you are offline.\n' +
                    'The movie is saved to the local storage until the connection is reestablished.');
                const {value} = await Storage.get({key: 'movies'});
                let movies_list: MovieProps[] = [];
                if (value) movies_list = JSON.parse(value);
                movies_list.push(movie);
                await Storage.set({
                    key: 'movies',
                    value: JSON.stringify(movies_list),
                });
                //const v2 = await Storage.get({key: 'movies'});
                //console.log(v2.value);
            }
            dispatch({ type: SAVE_MOVIE_FAILED, payload: { error } });
        }
    }

    async function deleteMovieCallback(movie: MovieProps) {
        try {
            log('deleteMovie started');
            dispatch({ type: DELETE_MOVIE_STARTED });
            await deleteMovie(token,movie);
            log('deleteMovie succeeded');
            dispatch({ type: DELETE_MOVIE_SUCCEEDED, payload: { movie: movie } });
        } catch (error) {
            log('deleteMovie failed');
            dispatch({ type: DELETE_MOVIE_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(token,message => {
            if (canceled) {
                return;
            }
            const { event, payload: movie } = message;
            log(`ws message, movie ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie } });
            }
        });
        return () => {   // in case the component is unmounted
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};