export const playgroundCopy = {
  en: {
    rooms: "Agent roundtables",
    sendMessage: "Send message",
    inbox: "PADIN Inbox",
    messageDetail: "Message details",
    assetPrice: "Asset price",
    tokenPrice: "Contract token price",
    intro:
      "Choose a capability. Configure a query. Inspect the result and reuse it through REST or MCP.",
    find: "Query capabilities",
    showPlanned: "Show planned capabilities",
    planned: "Planned · not available",
    notFound: "Unknown query page",
    native: "Native balance",
    token: "Token balance",
    common: "Common assets",
    transaction: "Transaction details",
    receipt: "Transaction receipt",
    nft: "NFT details",
    nftOwner: "NFT owner",
    nftBalance: "NFT holding quantity",
    tbaResolve: "Resolve NFT-bound account",
    tbaInspect: "Inspect NFT-bound account",
    nftTransfers: "NFT transfer history",
    nftTransfersText:
      "Complete transfer history requires an indexing service with explicit network coverage and pagination. Not connected yet.",
    walletNFTs: "Wallet NFTs",
    plannedText:
      "This query is not implemented yet. No request will be sent. Its API and provider coverage will be published when available.",
    transactionText:
      "Input: network + transaction hash. Inspect sender, recipient, value and block context.",
    receiptText:
      "Input: network + transaction hash. Inspect execution status, gas and logs. A missing receipt does not by itself mean a failed transaction.",
    nftText:
      "Input: network + contract + token ID. Chain data and external metadata will be identified separately.",
    walletNFTsText:
      "Input: network + wallet address. Requires an indexing provider with explicit coverage and pagination support.",
    unavailable:
      "No eligible provider for this capability and network. Refresh availability or choose another network.",
    snapshot: "Submitted parameters",
    changed: "Parameters changed — run again to update the result.",
    cancelNote:
      "Stopped waiting. The server may still complete and record the query.",
    json: "Standard JSON",
    overview: "Overview",
    request: "Request details",
    fee: "Platform fee (USD)",
  },
  zh: {
    rooms: "Agent 圆桌",
    sendMessage: "发送消息",
    inbox: "PADIN 收件箱",
    messageDetail: "消息详情",
    assetPrice: "主流币价格",
    tokenPrice: "合约代币价格",
    intro: "选择能力、填写参数、检查结果，通过 REST 或 MCP 复用同一查询。",
    find: "查询能力",
    showPlanned: "显示规划中能力",
    planned: "规划中 · 暂未开放",
    notFound: "查询页面不存在",
    native: "原生币余额",
    token: "代币余额",
    common: "常用资产",
    transaction: "交易详情",
    receipt: "交易回执 Receipt",
    nft: "NFT 详情",
    nftOwner: "NFT 所有者",
    nftBalance: "NFT 持有数量",
    tbaResolve: "解析 NFT 绑定账户",
    tbaInspect: "查询 NFT 绑定账户",
    nftTransfers: "NFT 转移记录",
    nftTransfersText:
      "完整转移记录需要有明确网络覆盖及分页支持的索引服务，目前尚未接入。",
    walletNFTs: "钱包 NFT 列表",
    plannedText:
      "这项查询尚未实现，不会发送请求。接口及服务商覆盖范围会在开放时公布。",
    transactionText:
      "输入：网络＋交易哈希。查看发送方、接收方、金额和区块信息。",
    receiptText:
      "输入：网络＋交易哈希。查看执行状态、Gas 和日志；未查到回执不直接代表交易失败。",
    nftText: "输入：网络＋合约＋Token ID。链上字段与外部元数据将分别标注来源。",
    walletNFTsText:
      "输入：网络＋钱包地址。需要具有明确覆盖范围和分页支持的索引型 Provider。",
    unavailable: "当前能力和网络没有可用线路，请刷新可用性或选择其他网络。",
    snapshot: "本次提交参数",
    changed: "参数已修改，请重新运行以更新结果。",
    cancelNote: "已停止等待，服务端仍可能完成查询并记录用量。",
    json: "标准 JSON",
    overview: "结果概览",
    request: "请求信息",
    fee: "平台费用（USD）",
  },
};
