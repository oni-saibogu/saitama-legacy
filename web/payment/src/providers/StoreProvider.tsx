"use client";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import type { Payment, PaymentLink } from "@saitamafun/sdk";

import { useAppDispatch } from "../store/hooks";
import { globalActions } from "../store/global";
import { makeStore, type AppStore } from "../store";

export default function StoreProvider({ children }: React.PropsWithChildren) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return <Provider store={storeRef.current}>{children}</Provider>;
}

type StoreIntialState = {
  payment?: Payment;
  paymentLink?: PaymentLink;
};

export function StoreIntialState({
  payment,
  paymentLink,
  children,
}: React.PropsWithChildren<StoreIntialState>) {
  const rendered = useRef<boolean>(null);

  const dispatch = useAppDispatch();
  if (!rendered.current && payment) dispatch(globalActions.setPayment(payment));
  if (!rendered.current && paymentLink)
    dispatch(globalActions.setPaymentLink(paymentLink));

  useEffect(() => {
    rendered.current = true;
  }, [rendered]);

  return children;
}
