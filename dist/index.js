#!/usr/bin/env node
import 'dotenv/config';
import './config.js';
import { startServer } from './server.js';
startServer().catch((error) => {
    console.error('Fatal error starting qtest-mcp-server:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map