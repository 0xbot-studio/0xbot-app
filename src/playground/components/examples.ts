export function requestExamples(endpoint: string, tool: string, body: object) {
  const json = JSON.stringify(body, null, 2);
  return {
    curl: [
      "curl https://api.0xbot.org" + endpoint,
      '-H "Authorization: Bearer $OXBOT_API_KEY"',
      '-H "Content-Type: application/json"',
      "-d '" + json.replaceAll("'", "'\\''") + "'",
    ].join(" \\\n  "),
    mcp: JSON.stringify({ name: tool, arguments: body }, null, 2),
    json,
  };
}
