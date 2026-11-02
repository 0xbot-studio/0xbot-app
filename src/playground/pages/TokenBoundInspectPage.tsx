import { useState } from "react";
import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { nftCopy } from "../nft/copy";
import {
  type NFTNetwork,
  NetworkField,
  AddressField,
  validAddress,
} from "../nft/fields";
import { ReadQueryFrame } from "../nft/ReadQueryFrame";
export function TokenBoundInspectPage() {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  const [network, setNetwork] = useState<NFTNetwork>("eip155:1"),
    [address, setAddress] = useState("");
  const body = { network, address };
  return (
    <ReadQueryFrame
      title={t.inspect}
      note={t.accountNote + " " + t.connectBalance}
      capability="data.token_bound_account.get"
      endpoint="/v1/data/token-bound-account/get"
      tool="get_token_bound_account"
      body={body}
      ready={validAddress(address)}
      execute={async (signal) =>
        result(
          await api.POST("/v1/data/token-bound-account/get", { body, signal }),
        )
      }
    >
      <NetworkField value={network} onChange={setNetwork} />
      <AddressField value={address} onChange={setAddress} label={t.address} />
    </ReadQueryFrame>
  );
}
