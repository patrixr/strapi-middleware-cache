/* eslint-disable consistent-return */
import produce from 'immer';

export const initialState = {
  strategy: {},
  isLoading: true,
};

const reducer = (state, action) =>
  produce(state, (draftState) => {
    switch (action.type) {
      case 'GET_DATA': {
        draftState.isLoading = true;
        draftState.strategy = {};
        break;
      }
      case 'GET_DATA_SUCCEEDED': {
        draftState.strategy = action.data;
        draftState.isLoading = false;
        break;
      }
      case 'GET_DATA_ERROR': {
        draftState.isLoading = false;
        break;
      }
      default:
        return draftState;
    }
  });

export default reducer;
