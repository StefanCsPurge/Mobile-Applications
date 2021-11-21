import { useEffect, useState } from 'react';
import {ConnectionStatus, Network} from "@capacitor/network";
import { createMovie, updateMovie } from '../movies_module/movieApi';
import {Storage} from "@capacitor/storage";
import {MovieProps} from "../movies_module/MovieProps";

const initialNetworkState = {
  connected: false,
  connectionType: 'unknown',
}

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState(initialNetworkState);
  useEffect(() => {
    Network.addListener('networkStatusChange', handleNetworkStatusChange);
    Network.getStatus().then(handleNetworkStatusChange);
    let canceled = false;
    return () => {
      canceled = true;
      // handler.remove();
    }

    async function handleNetworkStatusChange(status: ConnectionStatus) {
      console.log('useNetwork - status change', status);
      if (!canceled) {
        setNetworkStatus(status);
      }
      if(status.connected) {
        // Send the movies from the localstorage
        const {value} = await Storage.get({key: 'movies'});
        const res = await Storage.get({key: 'user'});
        if (value && res.value) {
          let movies_list: MovieProps[] = JSON.parse(value);
          await Storage.set({
            key: 'movies',
            value: JSON.stringify([]),
          });
          //let remaining_movies: MovieProps[] = [];
          for (let i=0; i<movies_list.length; i++)
            try {
              await (movies_list[i]._id ?
                  updateMovie(res.value, movies_list[i]) : createMovie(res.value, movies_list[i]));
            } catch (error: any) {
              console.log('Network status change to online - save movie failed - ' + error.message);
              //remaining_movies.push(movies_list[i]);
            }
          if (movies_list.length > 0)
              window.location.reload();
        }
      }
    }
  }, [])
  return { networkStatus };
};
