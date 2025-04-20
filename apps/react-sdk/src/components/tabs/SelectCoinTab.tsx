import { TabPanel } from "@headlessui/react";
import { MdChevronRight } from "react-icons/md";
import { useCallback, useMemo, useState } from "react";

import { Coin, coins } from "../../configs/coins";
import { globalActions } from "../../store/global";
import { useAPI } from "../../contexts/APIContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type SelectCoinTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SelectCoinTab({
  as = TabPanel,
  onNext,
}: SelectCoinTabProps) {
  const As = as;
  const { api } = useAPI();
  const dispatch = useAppDispatch();
  const [isSubmitting, setSubmitting] = useState(false);
  const { network, customer, paymentLink } = useAppSelector(
    (state) => state.global
  );
  const networkCoins = useMemo(
    () => (network ? coins[network.data] : []),
    [network]
  );

  const onSelect = useCallback(
    async (coin: Coin[string][number]) => {
      if (network && customer && paymentLink) {
        const wallet = await api.wallet
          .create({
            chain: network.data,
          })
          .then(({ data }) => data);

        return api.payment
          .create({
            amount: '10000',
            mint: coin.data,
            customer: customer.id,
            wallet: wallet.id,
            paymentLink: paymentLink.id,
          })
          .then(({ data }) => {
            dispatch(globalActions.setCoin(coin));
            dispatch(globalActions.setPayment(data));
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set("payment", data.id);
            window.location.search = searchParams.toString();
            return onNext();
          });
      }
    },
    [network, customer, api, paymentLink, dispatch, onNext]
  );

  return (
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 overflow-y-scroll dark:divide-black">
      {networkCoins.map((coin) => (
        <button
          disabled={isSubmitting}
          className="flex text-start items-center space-x-2 p-2 bg-stone-100 rounded-md dark:bg-dark-200"
          onClick={() => {
            setSubmitting(true);
            onSelect(coin).finally(() => setSubmitting(false));
          }}
        >
          <coin.icon size={36} />
          <span className="flex-1 capitalize">{coin.name}</span>
          <MdChevronRight className="text-xl hidden" />
        </button>
      ))}
    </As>
  );
}
