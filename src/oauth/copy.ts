export const oauthCopy = {
  en: {
    title: "Authorize an MCP connection",
    intro:
      "You are signed in. Review the exact permissions requested by this client before approving.",
    client: "Requesting client",
    warning:
      "Client names are self-declared, not verified by 0xbot. Only approve a connection you just started. Check the callback address below.",
    callback: "Return address",
    account: "Your account / workspace",
    permission: "Requested MCP permissions",
    limits:
      "No transfers, transaction signatures, account management or API key creation. Queries count toward your workspace limits. Access tokens last up to 15 minutes; the connection expires after 30 days unless revoked earlier.",
    approve: "Allow listed permissions",
    deny: "Deny",
    expired:
      "This authorization request expired, was already used, or belongs to another browser. Restart the connection from your MCP client.",
    grants: "Connected MCP apps",
    empty: "No active MCP connections.",
    revoke: "Revoke connection",
    confirm: "Revoke this connection and all its tokens immediately?",
    expiry: "Expires",
    note: "Revoking here also stops token refresh. Signing out of the website does not revoke these connections.",
    pending:
      "An MCP client is waiting. Sign in first; you will review its request before approving.",
    return: "Back to account",
  },
  zh: {
    title: "授权 MCP 连接",
    intro: "你已登录。请单独核对客户端请求的具体权限后再授权。",
    client: "发起请求的客户端",
    warning:
      "客户端名称由其自行声明，未经 0xbot 身份认证。请仅批准你刚刚主动发起的连接，并检查下方回调地址。",
    callback: "授权完成后的返回地址",
    account: "你的账号 / 工作区",
    permission: "请求的 MCP 权限",
    limits:
      "不允许转账、交易签名、账号管理或创建 API Key。查询计入工作区限额。访问令牌最长有效 15 分钟，连接 30 天后过期，也可提前撤销。",
    approve: "允许上述权限",
    deny: "拒绝",
    expired:
      "授权请求已过期、已被使用，或不属于当前浏览器。请从 MCP 客户端重新发起连接。",
    grants: "已连接的 MCP 应用",
    empty: "暂无有效的 MCP 授权。",
    revoke: "撤销连接",
    confirm: "立即撤销此连接及其全部令牌？",
    expiry: "过期时间",
    note: "撤销后也无法刷新令牌；仅退出网站登录不会撤销这些连接。",
    pending:
      "MCP 客户端正在等待。请先登录，之后会展示授权详情，由你决定是否允许。",
    return: "返回账号",
  },
};
