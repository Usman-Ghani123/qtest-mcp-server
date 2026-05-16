# qtest-mcp-server

> **Disclaimer:** This is an unofficial, community-built MCP server for qTest Manager. Not affiliated with or endorsed by Tricentis.

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that lets codebase or AI assistants (Claude, etc.) interact with qTest Manager — browse projects, manage test design modules, and build test execution cycles — all through natural language.

Available on npm: [qtest-mcp-server](https://www.npmjs.com/package/qtest-mcp-server)
Available on glama : [glama.ai](https://glama.ai/mcp/servers/Usman-Ghani123/qtest-mcp-server)
---

## Prerequisites

- Node.js 18+
- A qTest Manager account with API access
- Your qTest **base URL** and **API token**

---

## Installation & Setup

### 1. Clone and build

```bash
git clone https://github.com/your-username/qtest-mcp-server.git
cd qtest-mcp-server
npm install
npm run build
```

### 2. Configure your MCP client

Add the server to your `.mcp.json`. A ready-to-copy example is provided in `.mcp.example.json` at the root of this repo.

```json
{
  "mcpServers": {
    "qtest": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "QTEST_BASE_URL": "https://your-org.qtestnet.com",
        "QTEST_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

> Copy `.mcp.example.json` to `.mcp.json`, fill in your values, and place it in your project root (for project-scoped access).Your API token can be generated from qTest Manager under **Profile > API & SDK**.

---

## Available Tools

### Projects

| Tool | Description |
|------|-------------|
| `list-projects` | List all qTest projects, or fetch a single project by ID |

---

### Test Design

| Tool | Description |
|------|-------------|
| `list-modules` | List root-level modules, children of a module, or search by name |
| `create-module` | Create a new module (or sub-module) in Test Design |
| `delete-module` | Delete a module — cascades to all child modules and test cases |
| `list-test-cases` | Fetch test cases from a module with optional filters (Type, Status, Priority, etc.) |

---

### Test Execution

| Tool | Description |
|------|-------------|
| `list-test-cycle` | List root-level test cycles, children of a cycle, or filter by name/ID |
| `create-test-cycle` | Create a test cycle (or sub-cycle) in Test Execution |
| `delete-test-cycle` | Delete a test cycle — cascades to all child cycles, suites, and runs |
| `add-test-cases` | Add test cases as test runs into a test execution suite |

---

## Tool Usage Examples

### `list-projects`
List all projects or get a specific one.
```
list all projects
```
```
get project with ID 100001
```

---

### `list-modules`
List root-level modules, children, or search by name.
```
list modules for project 100001
```
```
list child modules of module 60000001 in project 100001
```
```
search for modules named "Login" in project 100001
```

---

### `create-module`
Create a module at root or nested under a parent.
```
create a module named "Sprint 12 Tests" in project 100001
```
```
create a sub-module named "Smoke Tests" under module 60000001 in project 100001
```

---

### `delete-module`
Delete a module and all its contents permanently.
```
delete module 60000099 in project 100001
```
> Warning: this cascades — all child modules and test cases are deleted.

---

### `list-test-cases`
Fetch test cases from a module, optionally filtered.
```
list all test cases in module 60000001 of project 100001
```
```
list test cases of type "Manual" in module 60000001 of project 100001
```
```
list test cases with status "Approved" in module 60000001 of project 100001
```

Available filter fields: `Type`, `Status`, `Priority`, `version`, etc.

---

### `list-test-cycle`
List test cycles at root, under a parent, or by name/ID.
```
list all test cycles in project 100001
```
```
list child cycles of test cycle 19000001 in project 100001
```
```
find test cycle named "Regression" in project 100001
```

---

### `create-test-cycle`
Create a test cycle at root or nested under a parent.
```
create a test cycle named "Release 3.0" in project 100001
```
```
create a sub-cycle named "Week 1" under test cycle 19000001 in project 100001
```

---

### `delete-test-cycle`
Delete a test cycle and all its contents permanently.
```
delete test cycle 19000099 in project 100001
```
> Warning: this cascades — all child cycles, test suites, and test runs are deleted.

---

### `add-test-cases`
Add test cases as test runs into a test execution suite.

> Note: The target is a **test suite** (inside a test cycle), not the cycle itself. You must supply test case IDs and names explicitly — use `list-test-cases` first to retrieve them.

```
add the following test cases to suite 88000001 in project 100001:
- ID 130000001: "Verify login with valid credentials"
- ID 130000002: "Verify error on invalid password"
```

---

## Development

```bash
# Run in dev mode (no build needed)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## License

MIT
