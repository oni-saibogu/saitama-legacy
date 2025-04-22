import type { Coin } from "@saitamafun/sdk";
import { useCallback, useState } from "react";
import { MdExpandMore } from "react-icons/md";
import {
  TabPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";

import { useAppDispatch } from "../../store/hooks";
import { useAPI } from "../../contexts/APIContext";
import { type Network, networks } from "../../configs";
import { globalActions, type GlobalState } from "../../store/global";

type SelectNetworkTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SelectNetworkTab({
  as = TabPanel,
  onNext,
}: SelectNetworkTabProps) {
  const As = as;
  const { api } = useAPI();
  const dispatch = useAppDispatch();

  const onSelect = useCallback(
    async (network: GlobalState["network"]) => {
      return api.coin
        .list({ chain: network.data })
        .then(({ data }) => data)
        .then((data) => {
          dispatch(globalActions.setNetwork(network));
          dispatch(globalActions.setCoins(data as unknown as Coin[]));

          return onNext();
        });
    },
    [dispatch, onNext]
  );

  return (
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 overflow-y-scroll dark:divide-black">
      {networks.map((network, index) => (
        <NetworkButton
          key={index}
          network={network}
          onSelect={onSelect}
        />
      ))}
    </As>
  );
}

type NetworkButtonProps = {
  network: Network;
  onSelect: (network: GlobalState["network"]) => Promise<void>;
};

const NetworkButton = ({ network, onSelect }: NetworkButtonProps) => {
  const As = network.chains ? Popover : "div";
  const Button = network.chains ? PopoverButton : "button";

  const [isLoading, setLoading] = useState(false);

  return (
    <As
      as="div"
      className="relative flex flex-col space-y-2"
    >
      <Button
        disabled={isLoading}
        className="flex text-start items-center space-x-2 !bg-stone-100 p-2 rounded-md dark:bg-dark-200"
        onClick={() => {
          if (network.chains) return;
          setLoading(true);
          return onSelect({
            name: network.name,
            data: network.data,
          }).finally(() => setLoading(false));
        }}
      >
        <network.icon size={36} />
        <span className="flex-1 capitalize">{network.name}</span>
        {network.chains && (
          <div
            aria-label="Expand"
            className="p-2"
          >
            <MdExpandMore className="text-xl text-stone-700" />
          </div>
        )}
      </Button>
      {network.chains && (
        <PopoverPanel className=" flex flex-col divide-y rounded-md bg-stone-100 dark:bg-dark-200 dark:divide-black">
          {network.chains.map((chain, index) => (
            <NetworkButton
              key={index}
              network={chain}
              onSelect={onSelect}
            />
          ))}
        </PopoverPanel>
      )}
    </As>
  );
};
