# n8n Integration Guide

You can integrate DevDiff into your **n8n** automation workflows using the HTTP Request node.

## Setting Up n8n Nodes

1. Add an **HTTP Request** Node.
2. Configure HTTP node properties:
   - **Method:** `POST`
   - **URL:** `http://localhost:3737/api/v1/analyze`
   - **Headers:** Add `X-API-Key` if authentication is configured.
   - **Body Parameters:** Send the repository path, branch name, and output configuration.
3. Extract the output text using json expressions, and connect it to Slack, Discord, or Email nodes to notify the team.
