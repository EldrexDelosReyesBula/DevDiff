/**
 * My DevDiff Plugin
 * 
 * A template for building DevDiff plugins.
 * Copy this, rename, and build your own.
 */

import { DevDiffPlugin, PluginContext } from '@eldrex/plugin-sdk'

export const plugin: DevDiffPlugin = {
  id: 'my-devdiff-plugin',
  name: 'My DevDiff Plugin',
  version: '1.0.0',
  description: 'What my plugin does',
  author: {
    name: 'Your Name',
    email: 'you@example.com',
    url: 'https://github.com/you/my-devdiff-plugin'
  },
  devdiffVersion: '>=1.0.5',
  
  // ── Lifecycle ──
  
  async activate(context: PluginContext) {
    context.logger.info('Plugin activated!')
    
    // Initialize your plugin here
    // - Connect to external services
    // - Load configuration
    // - Set up event listeners
  },
  
  async deactivate() {
    // Clean up resources
    // - Close connections
    // - Save state
    // - Remove listeners
  },
  
  // ── Hooks ──
  
  hooks: {
    async beforeAnalysis(diff, context) {
      // Modify or validate the diff before AI sees it
      // Example: Add custom metadata
      return diff
    },
    
    async afterAnalysis(changelog) {
      // Post-process the changelog
      // Example: Send to external system
      return changelog
    },
    
    async onError(error) {
      // Custom error handling
      // Example: Send to monitoring service
    },
    
    async onCommit(commit) {
      // React to new commits
      // Example: Trigger CI pipeline
    },
    
    async onAIComplete(result) {
      // Track AI usage
      // Example: Log token consumption
    }
  },
  
  // ── Custom Commands ──
  
  commands: [
    {
      name: 'my-plugin-status',
      description: 'Show plugin status',
      handler: async (args) => {
        console.log('Plugin is running!')
      }
    }
  ],
  
  // ── Configuration ──
  
  configSchema: {
    apiKey: {
      type: 'string',
      description: 'API key for external service',
      required: true,
      secret: true  // Will be masked in logs
    },
    endpoint: {
      type: 'string',
      description: 'Service endpoint URL',
      default: 'https://api.example.com'
    }
  }
}

export default plugin
