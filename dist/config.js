function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}\n` +
            `Set ${name} before starting qtest-mcp-server.`);
    }
    return value;
}
export const config = {
    baseUrl: requireEnv('QTEST_BASE_URL').replace(/\/$/, ''),
    token: requireEnv('QTEST_TOKEN'),
};
//# sourceMappingURL=config.js.map