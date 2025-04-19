import { MdChevronLeft, MdClose } from "react-icons/md";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import Modal from "./components/Model";
import SignUpTab from "./components/tabs/SignUpTab";
import SelectCoinTab from "./components/tabs/SelectCoinTab";
import SelectNetworkTab from "./components/tabs/SelectNetworkTab";
import WalletTransferTab from "./components/tabs/WalletTransferTab";


export default function App() {
  const [open, setOpen] = useState(true);
  const tabs = useMemo(
    () => [
      { name: "Sign up", component: SignUpTab },
      { name: "Select Network", component: SelectNetworkTab },
      { name: "Select Coin", component: SelectCoinTab },
      { name: "Payment Method", component: WalletTransferTab },
    ],
    []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentTab = useMemo(() => tabs[selectedIndex], [tabs, selectedIndex]);
  const canBack = useMemo(() => selectedIndex > 0, [selectedIndex]);
  const onBack = useCallback(() => {
    if (canBack) setSelectedIndex(selectedIndex - 1);
    else setOpen(false);
  }, [canBack, selectedIndex]);
  
  const onClose = useCallback(() => {
    if (canBack) return;
    onBack();
  }, [canBack, onBack])

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
            <p className="text-md md:text-sm">{ currentTab.name }</p>
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
