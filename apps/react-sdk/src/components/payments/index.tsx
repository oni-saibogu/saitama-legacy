import { useSearchParam } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { MdChevronLeft, MdClose } from "react-icons/md";
import { Fragment, useCallback, useMemo, useState } from "react";
import { TabGroup, TabList, Tab, TabPanel, TabPanels } from "@headlessui/react";

import Modal from "../Model";
import SignUpTab from "../tabs/SignUpTab";
import SelectCoinTab from "../tabs/SelectCoinTab";
import { useAPI } from "../../contexts/APIContext";
import { useAppDispatch } from "../../store/hooks";
import { globalActions } from "../../store/global";
import SelectNetworkTab from "../tabs/SelectNetworkTab";
import WalletTransferTab from "../tabs/WalletTransferTab";
import Loading from "../Loading";

const tabs = [
  { name: "Sign up", component: SignUpTab },
  { name: "Select Network", component: SelectNetworkTab },
  { name: "Select Coin", component: SelectCoinTab },
  { name: "Payment Method", component: WalletTransferTab },
];

export default function PaymentModal() {
  const { api } = useAPI();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(true);
  const paymentLinkId = useSearchParam("paymentLink");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const canBack = useMemo(() => selectedIndex > 0, [selectedIndex]);
  const currentTab = useMemo(() => tabs[selectedIndex], [selectedIndex]);

  const onBack = useCallback(() => {
    if (canBack) setSelectedIndex(selectedIndex - 1);
    else setOpen(false);
  }, [canBack, selectedIndex]);

  const onClose = useCallback(() => {
    if (canBack) return;
    onBack();
  }, [canBack, onBack]);

  const { isFetching } = useQuery({
    queryKey: [paymentLinkId],
    queryFn: () => {
      if (paymentLinkId)
        return api.paymentLink.retrieve(paymentLinkId).then(({ data }) => {
          dispatch(globalActions.setPaymentLink(data));
          return data;
        });
    },
    enabled: !!paymentLinkId,
  });

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={(index) => setSelectedIndex(index)}
    >
      <Modal
        open={open}
        onClose={onClose}
        onBack={onBack}
        closeIcon={canBack ? MdChevronLeft : MdClose}
        header={
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <p className="text-md md:text-sm">{currentTab.name}</p>
            <TabList className="flex items-center justify-center space-x-1">
              {tabs.map((_, index) => (
                <Tab
                  key={index}
                  as="div"
                  className="w-8 h-1 bg-violet/35 data-[selected]:bg-violet-700 rounded-full"
                />
              ))}
            </TabList>
          </div>
        }
      >
        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 rounded-md">
            <Loading className="size-8 border-white" />
          </div>
        )}
        <TabPanels as={Fragment}>
          {tabs.map((tab, index) => (
            <tab.component
              key={index}
              as={TabPanel}
              onNext={() => {
                if (selectedIndex < tabs.length - 1)
                  setSelectedIndex(selectedIndex + 1);
              }}
            />
          ))}
        </TabPanels>
      </Modal>
    </TabGroup>
  );
}
