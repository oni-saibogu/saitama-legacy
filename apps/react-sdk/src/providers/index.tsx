import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import APIProvider from "./APIProvider";
import StoreProvider from "./StoreProvider";

const client = new QueryClient();

type ProviderProps = {} & React.ComponentProps<typeof APIProvider>;

export default function Provider({
  children,
  ...props
}: React.PropsWithChildren<ProviderProps>) {
  return (
    <QueryClientProvider client={client}>
      <StoreProvider>
        <APIProvider {...props}>{children}</APIProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}
