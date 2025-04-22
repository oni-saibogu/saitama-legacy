"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import APIProvider from "./APIProvider";
import StoreProvider, { StoreIntialState } from "./StoreProvider";

const client = new QueryClient();

type ProviderProps = {} & React.ComponentProps<typeof StoreIntialState> &
  React.ComponentProps<typeof APIProvider>;

export default function Provider({
  children,
  apiKey,
  appId,
  baseURL,
  payment,
  paymentLink,
}: React.PropsWithChildren<ProviderProps>) {
  return (
    <QueryClientProvider client={client}>
      <StoreProvider>
        <APIProvider
          appId={appId}
          apiKey={apiKey}
          baseURL={baseURL}
        >
          <StoreIntialState
            payment={payment}
            paymentLink={paymentLink}
          >
            {children}
          </StoreIntialState>
        </APIProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
