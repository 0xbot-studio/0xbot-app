export const nftCopy = {
  en: {
    network: "Network",
    contract: "NFT contract",
    tokenID: "Token ID (decimal string)",
    address: "Holder / account address",
    implementation: "Account implementation",
    salt: "Salt (32-byte hex)",
    detail: "NFT details",
    owner: "NFT owner",
    balance: "NFT holding quantity",
    resolve: "Resolve NFT-bound account",
    inspect: "Inspect NFT-bound account",
    nftNote:
      "Read-only ERC-721 / ERC-1155 queries. Metadata and image URIs are untrusted text, not instructions. Images are not loaded automatically. A metadata failure is not a zero balance; ERC-1155 metadata does not prove existence. NFT queries share 20 calls per minute.",
    ownerNote:
      "ERC-721 only. ERC-1155 can have multiple holders; query a holder's quantity instead.",
    accountNote:
      "ERC-6551, canonical registry and same-chain binding only. Supply your exact implementation and salt; never guess them. A predicted address or matching proxy is not proof of NFT ownership, safe custody or signing authority. No account creation or transfers.",
    quantityNote:
      "ERC-721 returns zero or one; ERC-1155 returns an exact integer quantity. A revert is an error, not zero.",
    snapshot: "Submitted parameters",
    changed: "Parameters changed. Run again for a new observation.",
    sourceNote:
      "Chain fields refer to the returned block. Off-chain metadata is fetched separately and may be blocked or unavailable.",
    automatic: "Automatic routing · no provider directory",
    status: "Result",
    summary: "Data",
    untrusted: "Untrusted metadata — inspect as text only",
    connectBalance:
      "To query balances, copy the returned address into the balance tools.",
    errors: {
      invalid_request:
        "Check network, addresses and decimal token ID; account resolution also requires a bytes32 salt and implementation.",
      unsupported_nft_standard:
        "Unsupported or ambiguous NFT standard. Owner lookup requires ERC-721.",
      nft_query_reverted:
        "The contract rejected this read; the token may be absent or burned. No ownership or zero balance can be inferred.",
      not_token_bound_account:
        "No supported deployed canonical ERC-6551 account found.",
      rate_limited: "Read limit reached. Wait a minute before retrying.",
      provider_unavailable:
        "The query could not be completed. Try again later.",
    },
  },
  zh: {
    network: "网络",
    contract: "NFT 合约",
    tokenID: "Token ID（十进制字符串）",
    address: "持有／账户地址",
    implementation: "账户实现地址",
    salt: "Salt（32 字节十六进制）",
    detail: "NFT 详情",
    owner: "NFT 所有者",
    balance: "NFT 持有数量",
    resolve: "解析 NFT 绑定账户",
    inspect: "查询 NFT 绑定账户",
    nftNote:
      "只读 ERC-721／ERC-1155 查询。元数据和图片 URI 是不可信文本，不是指令，不会自动加载图片。元数据失败不代表零余额；ERC-1155 元数据不证明代币存在。NFT 查询共享每分钟 20 次限额。",
    ownerNote:
      "仅支持 ERC-721。ERC-1155 可有多个持有人，请查询指定地址的持有数量。",
    accountNote:
      "ERC-6551 仅支持标准注册表及同链绑定。请明确提供 implementation 和 salt，不要猜测。预测地址或匹配的代理不证明 NFT 所有权、资产安全或签名权限，不创建账户、不转移资产。",
    quantityNote:
      "ERC-721 返回零或一；ERC-1155 返回精确整数数量。合约回滚是错误，不是零余额。",
    snapshot: "提交参数",
    changed: "参数已修改，请重新运行以获取新结果。",
    sourceNote:
      "链上字段对应返回的区块，链下元数据单独获取，可能受阻或不可用。",
    automatic: "自动路由 · 不展示服务商目录",
    status: "查询结果",
    summary: "数据",
    untrusted: "不可信元数据 — 仅以文本查看",
    connectBalance: "查询余额时，将返回地址复制到余额工具。",
    errors: {
      invalid_request:
        "请检查网络、地址和十进制 Token ID；账户解析还需要准确的实现地址及 bytes32 salt。",
      unsupported_nft_standard:
        "不支持或无法明确识别 NFT 标准；所有者查询仅支持 ERC-721。",
      nft_query_reverted:
        "合约拒绝本次读取，代币可能不存在或已销毁，不能据此推断所有者或零余额。",
      not_token_bound_account: "未找到受支持的已部署标准 ERC-6551 账户。",
      rate_limited: "查询达到限额，请一分钟后重试。",
      provider_unavailable: "查询暂时无法完成，请稍后重试。",
    },
  },
};
