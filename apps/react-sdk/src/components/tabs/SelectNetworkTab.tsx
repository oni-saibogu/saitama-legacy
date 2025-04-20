import { useCallback } from "react";
import { MdExpandMore } from "react-icons/md";
import {
  TabPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";

import { Network, networks } from "../../configs";
import { useAppDispatch } from "../../store/hooks";
import { globalActions } from "../../store/global";

type SelectNetworkTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function SelectNetworkTab({
  as = TabPanel,
  onNext,
}: SelectNetworkTabProps) {
  const As = as;

  const dispatch = useAppDispatch();
  const onSelect = useCallback(
    (network: Network) => {
      dispatch(globalActions.setNetwork(network));
      onNext();
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
  onSelect: (network: Network) => void;
};

const NetworkButton = ({ network, onSelect }: NetworkButtonProps) => {
  const As = network.chains ? Popover : "div";
  const Button = network.chains ? PopoverButton : "button";

  return (
    <As
      as="div"
      className="relative flex flex-col space-y-2"
    >
      <Button
        className="flex text-start items-center space-x-2 !bg-stone-100 p-2 rounded-md dark:bg-dark-200"
        onClick={() => {
          if (network.chains) return;
          onSelect(network);
        }}
      >
        <network.icon size={36} />
        <span className="flex-1 capitalize">{network.name}</span>
        {network.chains && (
          <button
            aria-label="Expand"
            className="p-2"
          >
            <MdExpandMore className="text-xl text-stone-700" />
          </button>
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
