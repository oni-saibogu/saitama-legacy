import { createSlice } from "@reduxjs/toolkit";
import { Network } from "../configs";
import { Coin } from "../configs/coins";

type GlobalState = {
  network: Network | null;
  customer: { email: string };
  coin: Coin[string][number] | null;
};

const globalSlice = createSlice({
  name: "global",
  initialState: (): GlobalState => ({
    coin: null,
    network: null,
    customer: { email: "" },
  }),
  reducers: {
    setNetwork(state, { payload }: { payload: Network }) {
      state.network = payload;
    },
    setCoin(state, { payload }: { payload: Coin[string][number] }) {
      state.coin = payload;
    },
    setCustomer(state, {payload}: {payload: {email: string}}){
      state.customer = payload;
    }
  },
});

export const globalReducer = globalSlice.reducer;
export const globalActions = globalSlice.actions;
