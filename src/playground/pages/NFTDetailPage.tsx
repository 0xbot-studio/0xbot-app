import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { nftCopy } from "../nft/copy";
import { useNFTForm, NFTFields } from "../nft/fields";
import { ReadQueryFrame } from "../nft/ReadQueryFrame";
export function NFTDetailPage() {
  const { lang } = useLocale();
  const t = nftCopy[lang];
  const form = useNFTForm();
  const body = form.input;
  return (
    <ReadQueryFrame
      title={t.detail}
      note={t.nftNote}
      capability="nft.token"
      endpoint="/v1/nft/token"
      tool="get_nft_detail"
      body={body}
      ready={form.ready}
      execute={async (signal) =>
        result(await api.POST("/v1/nft/token", { body, signal }))
      }
    >
      <NFTFields form={form} />
    </ReadQueryFrame>
  );
}
