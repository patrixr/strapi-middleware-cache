const init = (initialState, shouldFetchData) => ({
  ...initialState,
  isLoading: shouldFetchData,
});

export default init;
