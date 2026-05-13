#!/usr/bin/env node
import 'dotenv/config'
import '@/config.js'
import { startServer } from '@/server.js'

startServer().catch((error: unknown) => {
  console.error('Fatal error starting qtest-mcp-server:', error)
  process.exit(1)
})
