import { Api, type Payment } from "@saitamafun/sdk";

import Provider from "../../providers";
import PaymentModal from "../../components/payments";
import { StoreIntialState } from "../../providers/StoreProvider";

export default async function PaymentPage({
  params,
  searchParams,
}: PageProps<{ id: string }, { payment: string }>) {
  const { id } = await params;
  const { payment: paymentId } = await searchParams;

  const appId = process.env.NEXT_PUBLIC_APP_ID;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const api = new Api(apiBaseURL, apiKey, appId);
  const paymentLink = await api.paymentLink
    .retrieve(id)
    .then(({ data }) => data);

  let payment: Payment | null = null;

  if (paymentId)
    payment = await api.payment.retrieve(paymentId).then(({ data }) => data);

  return (
    <Provider
      appId={appId}
      apiKey={apiKey}
      baseURL={apiBaseURL}
      payment={payment}
      paymentLink={paymentLink}
    >
      <PaymentModal />
    </Provider>
  );
}
