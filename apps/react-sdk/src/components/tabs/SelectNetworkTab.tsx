import { useCallback } from "react";
import { TabPanel } from "@headlessui/react";
import { MdChevronRight } from "react-icons/md";

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
    <As className="flex-1 flex flex-col space-y-1 divide-y px-4 dark:divide-black">
      {networks.map((network) => (
        <button
          className="flex text-start items-center space-x-2 p-2 bg-stone-100 rounded-md dark:bg-dark-200"
          onClick={() => onSelect(network)}
        >
          <network.icon size={36} />
          <span className="flex-1 capitalize">{network.name}</span>
          <MdChevronRight className="text-xl hidden" />
        </button>
      ))}
    </As>
  );
}
