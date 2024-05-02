import { IxType, VoyageProvider } from "js-moi-sdk";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import toast from "react-hot-toast";
import truncateStr from "../utils/truncateStr";
import { toastInfo, toastSuccess } from "../utils/toastWrapper";
import interaction from "../interface/interaction";

const AssetManager = ({ wallet, showConnectModal }) => {
  const [assets, setAssets] = useState([]); // All user assets
  const [interacting, setInteracting] = useState(false); // For loader
  const [transferReceipt, setTransferReceipt] = useState();

  const [receiver, setReceiver] = useState("");
  const [assetId, setAssetId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!wallet) {
      return setAssets([]);
    }

    getAssets(wallet.getAddress());
  }, [wallet]);

  const getAssets = async (address) => {
    const tdu = await interaction.GetUsersAsset(address);
    setAssets(tdu);
  };

  const transferAsset = async () => {
    try {
      if (!wallet) return showConnectModal(true);
      setInteracting(true);

      const ixReceipt = await interaction.TransferAsset(wallet, receiver, assetId, amount);

      setInteracting(false);
      toastSuccess("Transferred Asset Successfully");
      setTransferReceipt({ ...ixReceipt, amount });

      // Updates users assets
      await getAssets(wallet.getAddress());
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setInteracting(false);
    }
  };

  return (
    <div className="section">
      <div className="input-area">
        <div className="input-area__box">
          <label htmlFor="sender">Sender Address</label>
          <input disabled value={truncateStr(wallet?.getAddress(), 21)} name="sender" id="sender" />
        </div>
        <div className="input-area__box">
          <label htmlFor="receiver">Receiver Address</label>
          <input
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            id="receiver"
            name="receiver"
          />
        </div>
        <div className="input-area__box">
          <label htmlFor="assetId">Select Asset Id</label>
          <select
            value={assetId}
            className="input-area__box"
            onChange={(e) => setAssetId(e.target.value)}
            name="assetId"
            id="assetId"
          >
            <option value=""></option>
            {assets.map((asset, index) => (
              <option key={index} value={asset.asset_id}>
                {`${truncateStr(asset.asset_id, 21)} --- Balance ${asset.amount}`}
              </option>
            ))}
          </select>
        </div>
        <div className="input-area__box">
          <label htmlFor="amount">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            id="amount"
            name="amount"
          />
        </div>
        <button
          className="btn btn--grey"
          onClick={transferAsset}
          disabled={interacting || !receiver || !amount || !assetId}
        >
          <span style={{ marginRight: "10px" }}>Transfer Asset</span>
          <Loader color={"#374151"} size={20} loading={interacting} />
        </button>
      </div>
      {transferReceipt ? (
        <div>
          <h2 style={{ textAlign: "center" }}>Your Latest Transfer</h2>
          <p>From: {transferReceipt.from}</p>
          <p>To: {transferReceipt.to}</p>
          <p>Amount: {transferReceipt.amount}</p>
        </div>
      ) : null}
    </div>
  );
};

export default AssetManager;
