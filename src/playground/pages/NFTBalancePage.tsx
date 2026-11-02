import { useState } from "react";
import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { nftCopy } from "../nft/copy";
import {
  useNFTForm,
  NFTFields,
  AddressField,
  validAddress,
} from "../nft/fields";
import { ReadQueryFrame } from "../nft/ReadQueryFrame";
export function NFTBalancePage() {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  const form = useNFTForm();
  const [address, setAddress] = useState("");
  const body = { ...form.input, address };
  return (
    <ReadQueryFrame
      title={t.balance}
      note={t.quantityNote}
      capability="nft.balance"
      endpoint="/v1/nft/balance"
      tool="get_nft_balance"
      body={body}
      ready={form.ready && validAddress(address)}
      execute={async (signal) =>
        result(await api.POST("/v1/nft/balance", { body, signal }))
      }
    >
      <NFTFields form={form} />
      <AddressField value={address} onChange={setAddress} label={t.address} />
    </ReadQueryFrame>
  );
}
