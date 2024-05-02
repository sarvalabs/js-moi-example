import React, { useState } from "react";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { toastInfo, toastSuccess } from "../utils/toastWrapper";
import interaction from "../interface/interaction";
import { hexToBN } from "js-moi-sdk";

const AssetFactory = ({ wallet, showConnectModal }) => {
  const [assetStandard, setAssetStandard] = useState("MAS0");
  const [interacting, setInteracting] = useState(false); // For Loader
  const [createdAsset, setCreatedAsset] = useState();

  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");

  const createAsset = async () => {
    try {
      if (!wallet) return showConnectModal(true);
      setInteracting(true);

      const ixReceipt = await interaction.CreateAsset(wallet, assetStandard, symbol, supply);

      toastSuccess("Created Asset Successfully");
      setInteracting(false);

      const { asset_id } = ixReceipt.extra_data;

      const assetInfo = await interaction.GetAssetInfo(asset_id);
      setCreatedAsset({ ...assetInfo, id: asset_id });

      setSupply("");
      setSymbol("");
    } catch (error) {
      toast.error(error.message);
      setInteracting(false);
    }
  };

  return (
    <div className="section">
      <div className="input-area">
        <select
          value={assetStandard}
          className="input-area__box"
          onChange={(e) => setAssetStandard(e.target.value)}
          name="assetStandard"
          id="assetStandard"
        >
          <option value="MAS0">MAS0 - Fungible Asset</option>
          <option value="MAS1">MAS1 - Non-fungible Asset {`(NFT)`}</option>
        </select>
        <div className="input-area__box">
          <label htmlFor="symbol">Symbol</label>
          <input
            value={symbol}
            className=""
            onChange={(e) => setSymbol(e.target.value)}
            type="text"
            name="symbol"
            id="symbol"
          />
        </div>
        <div className="input-area__box">
          <label htmlFor="supply">Supply</label>
          <input
            value={assetStandard === "MAS1" ? 1 : supply}
            disabled={assetStandard === "MAS1"}
            onChange={(e) => setSupply(e.target.value)}
            type="text"
            id="supply"
            name="supply"
          />
        </div>
        <button
          className="btn btn--grey"
          onClick={createAsset}
          disabled={interacting || !supply || !symbol}
        >
          <span style={{ marginRight: "10px" }}>Create Asset</span>
          <Loader color={"#374151"} size={20} loading={interacting} />
        </button>
      </div>
      {createdAsset ? (
        <div>
          <h2 style={{ textAlign: "center" }}>Created Asset</h2>
          <p>Asset ID: {createdAsset.id}</p>
          <p>Asset Standard: MAS{hexToBN(createdAsset.standard)}</p>
          <p>Operator: {createdAsset.operator}</p>
          <p>Symbol: {createdAsset.symbol}</p>
          <p>Supply: {hexToBN(createdAsset.supply)}</p>
        </div>
      ) : null}
    </div>
  );
};

export default AssetFactory;
