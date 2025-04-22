import { TabPanel } from "@headlessui/react";
import { MdContentCopy } from "react-icons/md";

import Timer from "../Timer";
import QRCode from "../QRCode";
import Loading from "../Loading";
import { useAppSelector } from "../../store/hooks";

type WalletTransferTabProps = {
  as?: React.ElementType;
  onNext: React.Dispatch<React.SetStateAction<void>>;
};

export default function WalletTransferTab({
  as = TabPanel,
}: WalletTransferTabProps) {
  const As = as;
  const { payment, network, coin } = useAppSelector((state) => state.global);

  return (
    payment &&
    network &&
    coin && (
      <As className="flex-1 flex flex-col space-y-4 px-4 pb-4 overflow-y-scroll">
        <div className="flex-1 flex flex-col space-y-4 overflow-y-scrol">
          <div className="flex items-center space-x-4">
            <div>
              <p>
                Send&nbsp;
                <b className="text-violet-700 dark:text-violet">{coin.name}</b>
                &nbsp;via&nbsp;
                <b className="text-violet-700 capitalize dark:text-violet">
                  {coin.chain}
                </b>
                &nbsp;Network
              </p>
              <p className="text-xs text-black/75 dark:text-stone-300 md:text-sm">
                Open your crypto wallet or exchange and complete this payment
                transfer.
              </p>
            </div>
            <div>
              <Timer maxTimeInMinutes={9} />
            </div>
          </div>
          <div className="my-auto flex flex-col space-y-4">
            <QRCode
              className="m-auto w-56 h-56 rounded-md"
              data={payment.wallet.address}
            />
            <div className="flex flex-col divide-y bg-black/5 rounded-md dark:bg-dark-200/75 dark:divide-black">
              <div className="px-4 py-2">
                <p className="font-medium">Amount</p>
                <div className="flex items-center">
                  <p className="flex-1 text-xs text-black/50 dark:text-stone-300 md:text-sm">
                    4.00 USDC
                  </p>
                  <button>
                    <MdContentCopy />
                  </button>
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="font-medium">Address</p>
                <div className="flex items-center space-x-4">
                  <p className="text-xs text-black/50 truncate dark:text-stone-300 md:text-sm">
                    {payment.wallet.address}
                  </p>
                  <button>
                    <MdContentCopy />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center space-x-4 bg-violet-700 text-white p-2.5 rounded-md">
          <span>Waiting for payment</span>
          <Loading className="size-5 border-white" />
        </button>
      </As>
    )
  );
}
