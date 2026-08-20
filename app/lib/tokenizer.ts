export function splitTokens(raw: string) {
  return raw
    .split(/\n|,/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function resolveAnswerTokens(tokens: string[], choices: string[]) {
  return tokens
    .map((token) => {
      if (/^[A-Z]$/i.test(token)) {
        const index = token.toUpperCase().charCodeAt(0) - 65;
        return choices[index] || "";
      }
      const numeric = Number(token);
      if (Number.isInteger(numeric) && numeric >= 1 && numeric <= choices.length) {
        return choices[numeric - 1] || "";
      }
      return token;
    })
    .filter(Boolean);
}
