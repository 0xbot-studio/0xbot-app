import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { nftCopy } from "../nft/copy";
import { useNFTForm, NFTFields } from "../nft/fields";
import { ReadQueryFrame } from "../nft/ReadQueryFrame";
export function NFTOwnerPage() {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  const form = useNFTForm();
  const body = form.input;
  return (
    <ReadQueryFrame
      title={t.owner}
      note={t.ownerNote}
      capability="nft.owner"
      endpoint="/v1/nft/owner"
      tool="get_nft_owner"
      body={body}
      ready={form.ready}
      execute={async (signal) =>
        result(await api.POST("/v1/nft/owner", { body, signal }))
      }
    >
      <NFTFields form={form} />
    </ReadQueryFrame>
  );
}
