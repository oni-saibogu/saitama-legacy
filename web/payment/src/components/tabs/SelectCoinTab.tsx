import type { Coin } from "@saitamafun/sdk";

import { useCallback, useState } from "react";
import { TabPanel } from "@headlessui/react";
import { MdChevronRight } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";

import { toSVGURL } from "../../utils/svgUtils";
import { useAPI } from "../../contexts/APIContext";
import { globalActions } from "../../store/global";
import withSuspense from "../../composables/withSuspense";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type SelectCoinTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default withSuspense(function SelectCoinTab({
  as = TabPanel,
  onNext,
}: SelectCoinTabProps) {
  const As = as;
  const { api } = useAPI();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [isSubmitting, setSubmitting] = useState(false);
  const { network, customer, paymentLink, payment } = useAppSelector(
    (state) => state.global
  );

  const onSelect = useCallback(
    async (coin: Coin) => {
      if (network && customer && paymentLink) {
        const wallet = await api.wallet
          .create({
            network: network.id,
          })
          .then(({ data }) => data);

        if (payment)
          return api.payment.update(payment.id, {
            coin: coin.id,
          });

        return api.payment
          .create({
            amount: "10000",
            coin: coin.id,
            wallet: wallet.id,
            customer: customer.id,
            paymentLink: paymentLink.id,
          })
          .then(({ data }) => {
            dispatch(globalActions.setCoin(coin));
            dispatch(globalActions.setPayment(data));
            const params = new URLSearchParams(searchParams);
            params.set("payment", data.id);
            router.push("?" + params.toString());

            return onNext();
          });
      }
    },
    [network, customer, api, paymentLink, dispatch, onNext]
  );

  return (
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 overflow-y-scroll dark:divide-black">
      {network?.coins.map((coin, index) => (
        <button
          key={index}
          disabled={isSubmitting}
          className="flex text-start items-center space-x-2 p-2 bg-stone-100 rounded-md dark:bg-dark-200"
          onClick={() => {
            setSubmitting(true);
            onSelect(coin).finally(() => setSubmitting(false));
          }}
        >
          <img
            src={toSVGURL(coin.logo)}
            width={32}
            height={32}
          />
          <span className="flex-1 capitalize">{coin.name}</span>
          <MdChevronRight className="text-xl hidden" />
        </button>
      ))}
    </As>
  );
});
