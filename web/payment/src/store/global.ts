import { createSlice } from "@reduxjs/toolkit";
import type { Customer, Payment, PaymentLink } from "@saitamafun/sdk";

import { Network } from "../configs";
import { Coin } from "../configs/coins";

export type GlobalState = {
  payment: Payment | null;
  network: Omit<Network, "icon" | "chains"> | null;
  customer: Customer | null;
  paymentLink: PaymentLink | null;
  coin: Omit<Coin[string][number], "icon"> | null;
};

const globalSlice = createSlice({
  name: "global",
  initialState: (): GlobalState => ({
    coin: null,
    network: null,
    customer: null,
    payment: null,
    paymentLink: null,
  }),
  reducers: {
    setCustomer(state, { payload }: { payload: Customer }) {
      state.customer = payload;
    },
    setNetwork(state, { payload }: { payload: GlobalState["network"] }) {
      state.network = payload;
    },
    setCoin(state, { payload }: { payload: GlobalState["coin"] }) {
      state.coin = payload;
    },
    setPayment(state, { payload }: { payload: Payment }) {
      state.payment = payload;
    },
    setPaymentLink(state, { payload }: { payload: PaymentLink }) {
      state.paymentLink = payload;
    },
  },
});

export const globalReducer = globalSlice.reducer;
export const globalActions = globalSlice.actions;
