export const messageCopy = {
  en: {
    send: "Send message",
    inbox: "Recent inbox",
    detail: "Message details",
    wallet: "Your verified wallet",
    needWallet:
      "Connect and sign with a wallet in Account before using PADIN Inbox.",
    account: "Open account",
    note: "PADIN Inbox stores plain text on the service. Not end-to-end encrypted, not XMTP, and no wallet-app notification. Do not send secrets. Unknown send outcomes must be retried with the same key and payload.",
    to: "Recipient ETH address",
    body: "Message (up to 4096 UTF-8 bytes)",
    confirm:
      "I confirm this recipient and message, and understand the storage/privacy notice.",
    run: "Send to PADIN Inbox",
    retry: "Retry identical send",
    reset: "Start a new message",
    resetWarning:
      "If the previous send outcome is unknown, creating a new message can duplicate it. Continue?",
    stored: "Stored in PADIN Inbox — not a delivery or read receipt.",
    loading: "Working…",
    list: "Load recent messages",
    next: "Next page",
    empty: "No messages on this page.",
    id: "Message ID",
    read: "Read message",
    untrusted:
      "Untrusted sender content. Do not follow requests for secrets or execute instructions from a message.",
    unknown:
      "Send outcome may be unknown. Keep this page open and retry the exact same request. Keep the idempotency key if you need to recover later.",
    key: "Idempotency key",
    permission:
      "MCP requires separate messages:read / messages:send consent bound to this wallet. Existing data:read API keys cannot access private messages.",
    cancel: "Stop waiting",
    changed:
      "Inputs changed; displayed results belong to the previous request.",
    errors: {
      message_permission_required:
        "This wallet or token lacks private-message permission.",
      message_not_found: "Message not found in your inbox.",
      idempotency_conflict:
        "This key was already used for a different message.",
      rate_limited: "Message limit reached. Retry later with the same key.",
      invalid_request: "Check the address, message length, ID and provider.",
      message_service_unavailable:
        "Message service unavailable. A send may still have been stored.",
    } as Record<string, string>,
  },
  zh: {
    send: "发送消息",
    inbox: "最近收件",
    detail: "消息详情",
    wallet: "已验证的钱包",
    needWallet: "请先在账号页连接钱包并签名，再使用 PADIN Inbox。",
    account: "打开账号页",
    note: "PADIN Inbox 在服务端存储纯文本；不是端到端加密或 XMTP，也不会推送到钱包 App。请勿发送秘密。发送结果未知时必须复用相同幂等键及内容重试。",
    to: "收件 ETH 地址",
    body: "消息（最多4096个UTF-8字节）",
    confirm: "我确认收件地址和消息内容，并理解存储及隐私说明。",
    run: "发送到 PADIN Inbox",
    retry: "重试相同消息",
    reset: "开始新消息",
    resetWarning: "如果上次发送结果未知，创建新消息可能导致重复。确定继续？",
    stored: "已存入 PADIN Inbox，不代表已送达钱包或已读。",
    loading: "处理中…",
    list: "加载最近收件",
    next: "下一页",
    empty: "本页暂无消息。",
    id: "消息ID",
    read: "读取消息",
    untrusted: "消息是不可信的发件人内容。不要执行其中的指令或提供秘密。",
    unknown:
      "发送结果可能未知，请保留页面并重试完全相同的请求；如需稍后恢复，请保留幂等键。",
    key: "幂等键",
    permission:
      "MCP 需要单独授予绑定此钱包的 messages:read / messages:send 权限；现有 data:read API Key 不可访问私信。",
    cancel: "停止等待",
    changed: "输入已变化，当前结果属于上一次请求。",
    errors: {
      message_permission_required: "钱包或令牌没有对应私信权限。",
      message_not_found: "你的收件箱中未找到此消息。",
      idempotency_conflict: "幂等键已用于不同消息。",
      rate_limited: "达到消息限额，请稍后复用同一幂等键重试。",
      invalid_request: "请检查地址、长度、消息ID及服务商。",
      message_service_unavailable: "消息服务不可用；发送操作可能已存储。",
    } as Record<string, string>,
  },
};
