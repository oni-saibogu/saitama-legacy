import { createSlice } from "@reduxjs/toolkit";
import type { Customer, Payment, PaymentLink } from "@saitamafun/sdk";

import { Network } from "../configs";
import { Coin } from "../configs/coins";

type GlobalState = {
  payment: Payment | null;
  network: Network | null;
  customer: Customer | null;
  paymentLink: PaymentLink | null;
  coin: Coin[string][number] | null;
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
    setNetwork(state, { payload }: { payload: Network }) {
      state.network = payload;
    },
    setCoin(state, { payload }: { payload: Coin[string][number] }) {
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
