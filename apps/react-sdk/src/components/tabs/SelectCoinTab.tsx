import { useCallback, useMemo } from "react";
import { TabPanel } from "@headlessui/react";
import { MdChevronRight } from "react-icons/md";

import { Coin, coins } from "../../configs/coins";
import { globalActions } from "../../store/global";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

type SelectCoinTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SelectCoinTab({ as = TabPanel, onNext }: SelectCoinTabProps) {
  const As = as;
  const dispatch = useAppDispatch();
  const { network } = useAppSelector((state) => state.global);
  const onSelect = useCallback(
    (coin: Coin[string][number]) => {
      dispatch(globalActions.setCoin(coin));
      onNext();
    },
    [dispatch, onNext]
  );
  const networkCoins = useMemo(
    () => (network ? coins[network.name] : []),
    [network]
  );

  return (
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 overflow-y-scroll dark:divide-black">
      {networkCoins.map((coin) => (
        <button
          className="flex text-start items-center space-x-2 p-2 bg-stone-100 rounded-md dark:bg-dark-200"
          onClick={() => onSelect(coin)}
        >
          <coin.icon size={36} />
          <span className="flex-1 capitalize">{coin.name}</span>
          <MdChevronRight className="text-xl hidden" />
        </button>
      ))}
    </As>
  );
}
