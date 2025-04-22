import { configureStore } from "@reduxjs/toolkit";

import { globalReducer } from "./global";

export const makeStore = () => {
  return configureStore({
    reducer: {
      global: globalReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;
