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
export function TokenBoundResolvePage() {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  const form = useNFTForm();
  const [implementation, setImplementation] = useState("");
  const [salt, setSalt] = useState("");
  const body = {
    network: form.input.network,
    token_contract: form.input.contract,
    token_id: form.input.token_id,
    implementation,
    salt,
  };
  return (
    <ReadQueryFrame
      title={t.resolve}
      note={t.accountNote}
      capability="data.token_bound_account.resolve"
      endpoint="/v1/data/token-bound-account/resolve"
      tool="resolve_token_bound_account"
      body={body}
      ready={
        form.ready &&
        validAddress(implementation) &&
        /^0x[0-9a-fA-F]{64}$/.test(salt)
      }
      execute={async (signal) =>
        result(
          await api.POST("/v1/data/token-bound-account/resolve", {
            body,
            signal,
          }),
        )
      }
    >
      <NFTFields form={form} />
      <AddressField
        value={implementation}
        onChange={setImplementation}
        label={t.implementation}
      />
      <label>
        {t.salt}
        <input
          required
          pattern="0x[0-9a-fA-F]{64}"
          value={salt}
          onChange={(e) => setSalt(e.target.value)}
        />
      </label>
    </ReadQueryFrame>
  );
}
