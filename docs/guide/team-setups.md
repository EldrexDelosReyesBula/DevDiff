# Team Setups

For teams running DevDiff across multiple repositories, we recommend using the central **DevDiff Gateway**.

## Setup Gateway Service

1. Run the gateway server on a central server:
   ```bash
   npx @eldrex/gateway
   ```
2. Configure your repositories' webhooks to point to the gateway's `/webhooks` endpoints.
3. Configure Slack or Discord outputters in the gateway's `gateway.config.json` to stream changelogs directly to your product channels.
