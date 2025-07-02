#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const N8N_HOST_URL = process.env.N8N_HOST_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// Validate configuration
if (!N8N_HOST_URL || !N8N_API_KEY) {
  console.error('Error: N8N_HOST_URL and N8N_API_KEY must be set');
  process.exit(1);
}

// Create axios instance with default config
const n8nClient = axios.create({
  baseURL: `${N8N_HOST_URL}/api/v1`,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Create MCP server
const server = new Server(
  {
    name: 'n8n-cloud-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: 'list_workflows',
    description: 'Get all n8n workflows',
    inputSchema: {
      type: 'object',
      properties: {
        active: {
          type: 'boolean',
          description: 'Filter by active status'
        },
        limit: {
          type: 'number',
          description: 'Number of workflows to return (default: 100)'
        }
      }
    }
  },
  {
    name: 'get_workflow',
    description: 'Get a specific workflow by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The workflow ID'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'list_workflow_webhooks',
    description: 'Get all webhooks in a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The ID of the workflow to get webhooks from'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'call_webhook_get',
    description: 'Call a GET webhook',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The webhook URL to call'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'call_webhook_post',
    description: 'Call a POST webhook',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The webhook URL to call'
        },
        data: {
          type: 'object',
          description: 'Data to send in the POST request body'
        }
      },
      required: ['url', 'data']
    }
  },
  {
    name: 'list_executions',
    description: 'Get workflow executions',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Filter by workflow ID'
        },
        status: {
          type: 'string',
          enum: ['success', 'error', 'waiting'],
          description: 'Filter by execution status'
        },
        limit: {
          type: 'number',
          description: 'Number of executions to return (default: 20)'
        }
      }
    }
  },
  {
    name: 'get_execution',
    description: 'Get details of a specific execution',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'The execution ID'
        }
      },
      required: ['id']
    }
  }
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_workflows': {
        const params = new URLSearchParams();
        if (args.active !== undefined) params.append('active', args.active.toString());
        if (args.limit) params.append('limit', args.limit.toString());
        
        const response = await n8nClient.get(`/workflows?${params.toString()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case 'get_workflow': {
        const response = await n8nClient.get(`/workflows/${args.id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case 'list_workflow_webhooks': {
        // First get the workflow
        const workflowResponse = await n8nClient.get(`/workflows/${args.id}`);
        const workflow = workflowResponse.data;
        
        // Extract webhooks from workflow nodes
        const webhooks = workflow.nodes.filter(node => 
          node.type === 'n8n-nodes-base.webhook'
        ).map(node => ({
          id: node.webhookId,
          name: node.name,
          path: node.parameters.path,
          httpMethod: node.parameters.httpMethod || 'GET',
          url: `${N8N_HOST_URL}/webhook/${node.parameters.path}`,
          disabled: node.disabled || false
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(webhooks, null, 2)
            }
          ]
        };
      }

      case 'call_webhook_get': {
        const response = await axios.get(args.url);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case 'call_webhook_post': {
        const response = await axios.post(args.url, args.data);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case 'list_executions': {
        const params = new URLSearchParams();
        if (args.workflowId) params.append('workflowId', args.workflowId);
        if (args.status) params.append('status', args.status);
        if (args.limit) params.append('limit', args.limit.toString());
        
        const response = await n8nClient.get(`/executions?${params.toString()}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      case 'get_execution': {
        const response = await n8nClient.get(`/executions/${args.id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('n8n Cloud MCP Server running...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});