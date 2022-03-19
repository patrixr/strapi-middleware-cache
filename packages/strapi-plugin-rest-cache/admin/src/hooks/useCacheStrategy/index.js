import { useEffect, useReducer, useRef } from 'react';
import { request, useNotification } from '@strapi/helper-plugin';
import init from './init';
import pluginId from '../../pluginId';
import reducer, { initialState } from './reducer';

const useCacheStrategy = (shouldFetchData = true) => {
  const [{ strategy, isLoading }, dispatch] = useReducer(
    reducer,
    initialState,
    () => init(initialState, shouldFetchData)
  );
  const toggleNotification = useNotification();

  const isMounted = useRef(true);
  const abortController = new AbortController();
  const { signal } = abortController;

  useEffect(() => {
    if (shouldFetchData) {
      fetchCacheStrategy();
    }

    return () => {
      abortController.abort();
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchData]);

  const fetchCacheStrategy = async () => {
    try {
      dispatch({
        type: 'GET_DATA',
      });

      const { strategy } = await request(`/${pluginId}/config/strategy`, {
        method: 'GET',
        signal,
      });

      dispatch({
        type: 'GET_DATA_SUCCEEDED',
        data: strategy,
      });
    } catch (err) {
      const message = err?.response?.payload?.message ?? 'An error occured';

      if (isMounted.current) {
        dispatch({
          type: 'GET_DATA_ERROR',
        });

        if (message !== 'Forbidden') {
          toggleNotification({
            type: 'warning',
            message,
          });
        }
      }
    }
  };

  return { strategy, isLoading, getData: fetchCacheStrategy };
};

export default useCacheStrategy;
