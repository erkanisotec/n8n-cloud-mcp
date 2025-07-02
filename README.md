# n8n Cloud MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with n8n Cloud workflows through a standardized interface.

## Features

### 🔄 Workflow Management
- **List workflows** - Get all workflows with filtering options (active/inactive)
- **Get workflow details** - Retrieve complete workflow configuration
- **Create workflow** - Build new workflows programmatically
- **Update workflow** - Modify existing workflow nodes, connections, and settings
- **Delete workflow** - Remove workflows from your n8n instance
- **Activate/Deactivate** - Control workflow execution state

### 🪝 Webhook Operations
- **List webhooks** - Extract all webhook URLs from a workflow
- **Call webhooks** - Execute webhooks with GET and POST methods
- **Test integrations** - Trigger webhook-based workflows

### 📊 Execution Management
- **List executions** - View workflow run history with status filtering
- **Get execution details** - Access detailed execution logs and data
- **Execute workflow** - Manually trigger workflow runs with custom data

### 🏷️ Additional Features
- **Workflow tags** - Retrieve and manage workflow tags
- **Error handling** - Comprehensive error messages and debugging
- **Secure authentication** - API key-based security

## Installation

### Using npm (recommended)

```bash
npm install -g @erkanisotec/n8n-cloud-mcp
```

### Using Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n8n-cloud": {
      "command": "npx",
      "args": ["-y", "@erkanisotec/n8n-cloud-mcp"],
      "env": {
        "N8N_HOST_URL": "https://your-instance.app.n8n.cloud",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### From source

```bash
git clone https://github.com/erkanisotec/n8n-cloud-mcp.git
cd n8n-cloud-mcp
npm install
```

Then add to Claude Desktop config:

```json
{
  "mcpServers": {
    "n8n-cloud": {
      "command": "node",
      "args": ["/path/to/n8n-cloud-mcp/index.js"],
      "env": {
        "N8N_HOST_URL": "https://your-instance.app.n8n.cloud",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Configuration

### Environment Variables

- `N8N_HOST_URL` (required): Your n8n instance URL (e.g., `https://myapp.app.n8n.cloud`)
- `N8N_API_KEY` (required): Your n8n API key

### Getting your n8n API Key

1. Log in to your n8n Cloud instance
2. Go to **Settings** > **n8n API**
3. Click **Create an API key**
4. Copy the generated key

## Available Tools

### Workflow Management

#### 1. `list_workflows`
List all workflows in your n8n instance.

**Parameters:**
- `active` (boolean, optional): Filter by active status
- `limit` (number, optional): Number of workflows to return

**Example:**
```
"List all active workflows"
"Show me the first 10 workflows"
```

#### 2. `get_workflow`
Get detailed information about a specific workflow.

**Parameters:**
- `id` (string, required): The workflow ID

**Example:**
```
"Get details for workflow ABC123"
```

#### 3. `create_workflow`
Create a new workflow.

**Parameters:**
- `name` (string, required): Workflow name
- `nodes` (array, required): Array of nodes
- `connections` (object, required): Node connections
- `active` (boolean, optional): Whether to activate the workflow
- `settings` (object, optional): Workflow settings

**Example:**
```
"Create a new workflow called 'My Test Workflow'"
```

#### 4. `update_workflow`
Update an existing workflow.

**Parameters:**
- `id` (string, required): Workflow ID
- `name` (string, optional): New workflow name
- `nodes` (array, optional): Updated nodes
- `connections` (object, optional): Updated connections
- `active` (boolean, optional): Activation status
- `settings` (object, optional): Updated settings

**Example:**
```
"Update workflow ABC123 and rename it to 'Updated Workflow'"
```

#### 5. `delete_workflow`
Delete a workflow.

**Parameters:**
- `id` (string, required): Workflow ID to delete

**Example:**
```
"Delete workflow ABC123"
```

#### 6. `activate_workflow`
Activate a workflow.

**Parameters:**
- `id` (string, required): Workflow ID to activate

**Example:**
```
"Activate workflow ABC123"
```

#### 7. `deactivate_workflow`
Deactivate a workflow.

**Parameters:**
- `id` (string, required): Workflow ID to deactivate

**Example:**
```
"Deactivate workflow ABC123"
```

### Webhook Operations

#### 8. `list_workflow_webhooks`
List all webhook triggers in a workflow.

**Parameters:**
- `id` (string, required): The workflow ID

**Example:**
```
"Show me all webhooks in workflow ABC123"
```

#### 9. `call_webhook_get`
Trigger a webhook with GET method.

**Parameters:**
- `url` (string, required): The webhook URL

**Example:**
```
"Call the webhook at https://myapp.app.n8n.cloud/webhook/abc123"
```

#### 10. `call_webhook_post`
Trigger a webhook with POST method.

**Parameters:**
- `url` (string, required): The webhook URL
- `data` (object, required): JSON data to send

**Example:**
```
"Send {name: 'John', email: 'john@example.com'} to webhook abc123"
```

### Execution Management

#### 11. `list_executions`
List workflow executions.

**Parameters:**
- `workflowId` (string, optional): Filter by workflow ID
- `status` (string, optional): Filter by status (success, error, waiting)
- `limit` (number, optional): Number of executions to return

**Example:**
```
"Show me the last 5 failed executions"
"List executions for workflow ABC123"
```

#### 12. `get_execution`
Get details of a specific execution.

**Parameters:**
- `id` (string, required): The execution ID

**Example:**
```
"Get details for execution 12345"
```

#### 13. `execute_workflow`
Manually trigger a workflow execution.

**Parameters:**
- `id` (string, required): Workflow ID to execute
- `data` (object, optional): Data to pass to the workflow

**Example:**
```
"Execute workflow ABC123 with data {test: true}"
```

### Additional Tools

#### 14. `get_workflow_tags`
Get all workflow tags.

**Parameters:** None

**Example:**
```
"Show me all workflow tags"
```

## Usage Examples

### With Claude

Once configured, you can use natural language commands:

```
"List my n8n workflows"
"Show me active workflows only"
"Get webhooks for my data processing workflow"
"Trigger the customer onboarding webhook with {email: 'test@example.com'}"
"Show me failed executions from the last hour"
```

### Direct API Usage

You can also use the tools directly:

```javascript
// List workflows
{
  "tool": "list_workflows",
  "arguments": {
    "active": true,
    "limit": 10
  }
}

// Trigger webhook
{
  "tool": "call_webhook_post",
  "arguments": {
    "url": "https://myapp.app.n8n.cloud/webhook/customer-signup",
    "data": {
      "email": "customer@example.com",
      "plan": "premium"
    }
  }
}
```

## Troubleshooting

### 404 Errors

If you're getting 404 errors:
1. Verify your `N8N_HOST_URL` is correct
2. Ensure your API key has the necessary permissions
3. Check that the workflow/webhook IDs exist

### Authentication Errors

1. Verify your API key is valid and not expired
2. Ensure the API key is properly set in the environment
3. Check API key permissions in n8n settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Created by [erkanisotec](https://github.com/erkanisotec)

## Links

- [GitHub Repository](https://github.com/erkanisotec/n8n-cloud-mcp)
- [n8n Documentation](https://docs.n8n.io)
- [MCP Documentation](https://modelcontextprotocol.io)