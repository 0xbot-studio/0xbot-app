import { useState } from "react";
import { useLocale } from "../../i18n/Locale";
import { nftCopy } from "./copy";
export type NFTNetwork = "eip155:1" | "eip155:56" | "eip155:137";
export const validAddress = (s: string) =>
  /^0x[0-9a-fA-F]{40}$/.test(s) && !/^0x0{40}$/.test(s);
export function validTokenID(s: string) {
  return /^(0|[1-9][0-9]{0,77})$/.test(s) && BigInt(s) < 1n << 256n;
}
export function NetworkField({
  value,
  onChange,
}: {
  value: NFTNetwork;
  onChange: (v: NFTNetwork) => void;
}) {
  const { lang } = useLocale();
  return (
    <label>
      {nftCopy[lang].network}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NFTNetwork)}
      >
        <option value="eip155:1">Ethereum</option>
        <option value="eip155:56">BNB Smart Chain</option>
        <option value="eip155:137">Polygon PoS</option>
      </select>
    </label>
  );
}
export function AddressField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0x…"
        required
        pattern="0x[0-9a-fA-F]{40}"
        autoComplete="off"
      />
    </label>
  );
}
export function useNFTForm() {
  const [network, setNetwork] = useState<NFTNetwork>("eip155:1"),
    [contract, setContract] = useState(""),
    [token_id, setTokenID] = useState("");
  return {
    input: { network, contract, token_id },
    setNetwork,
    setContract,
    setTokenID,
    ready: validAddress(contract) && validTokenID(token_id),
  };
}
export function NFTFields({ form }: { form: ReturnType<typeof useNFTForm> }) {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  return (
    <>
      <NetworkField value={form.input.network} onChange={form.setNetwork} />
      <AddressField
        value={form.input.contract}
        onChange={form.setContract}
        label={t.contract}
      />
      <label>
        {t.tokenID}
        <input
          required
          inputMode="numeric"
          pattern="0|[1-9][0-9]{0,77}"
          maxLength={78}
          value={form.input.token_id}
          onChange={(e) => form.setTokenID(e.target.value)}
        />
      </label>
    </>
  );
}
