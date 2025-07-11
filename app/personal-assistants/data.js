// Voice AI Platform Data Object Structure
const voiceAIPlatformData = {
 // System Configuration
 system: {
   id: "voice-ai-platform-001",
   name: "Voice AI Platform",
   description: "Multi-Agent Voice System",
   version: "2.1.0",
   lastUpdated: "2025-07-07T10:30:00Z",
   status: "operational",
   environment: "production"
 },

 // Agent Configuration
 agents: [
   {
     id: "router-agent-001",
     name: "Router Agent",
     type: "router",
     status: "active",
     
     // Agent Identity
     identity: {
       icon: "bot", // bot, message, settings, zap
       colorTheme: "#8B5CF6",
       avatar: null,
       displayName: "Router Agent",
       description: "Customize personality, knowledge, and capabilities"
     },

     // Personality Configuration
     personality: {
       traits: [
         "analytical",
         "efficient", 
         "neutral"
       ],
       suggestedTraits: [
         "professional",
         "enthusiastic", 
         "creative",
         "supportive",
         "detail-oriented",
         "proactive",
         "diplomatic"
       ],
       sliders: {
         formality: {
           value: 80,
           min: 0,
           max: 100,
           label: "Formality",
           icon: "🎭"
         },
         empathy: {
           value: 30,
           min: 0,
           max: 100,
           label: "Empathy",
           icon: "❤️"
         },
         humor: {
           value: 10,
           min: 0,
           max: 100,
           label: "Humor",
           icon: "😊"
         },
         verbosity: {
           value: 40,
           min: 0,
           max: 100,
           label: "Verbosity",
           icon: "🗣️"
         }
       },
       communicationTone: "Professional" // Professional, Casual, Friendly, Formal, Conversational
     },

     // Knowledge Base
     knowledgeBase: {
       sources: [
         {
           id: "kb-001",
           name: "Company Policies",
           type: "document",
           status: "active",
           lastUpdated: "2025-07-01T00:00:00Z",
           size: "2.5MB"
         },
         {
           id: "kb-002", 
           name: "Product Catalog",
           type: "database",
           status: "active",
           lastUpdated: "2025-07-05T12:00:00Z",
           size: "15.2MB"
         }
       ],
       totalSources: 12,
       totalSize: "45.7MB",
       lastSync: "2025-07-07T09:15:00Z"
     },

     // Tools & Skills
     toolsAndSkills: {
       enabledTools: [
         "web_search",
         "calendar_integration",
         "email_composer",
         "data_analyzer"
       ],
       availableTools: [
         "web_search",
         "calendar_integration", 
         "email_composer",
         "data_analyzer",
         "file_processor",
         "translation_service",
         "sentiment_analyzer"
       ],
       customSkills: [
         {
           id: "skill-001",
           name: "Customer Support Flow",
           description: "Handles customer inquiries and escalations",
           enabled: true
         }
       ]
     },

     // Advanced Configuration
     advanced: {
       responseSettings: {
         maxResponseTime: 3000, // milliseconds
         maxTokens: 1000,
         temperature: 0.7,
         topP: 0.9
       },
       integrations: {
         crm: {
           enabled: true,
           provider: "salesforce",
           apiKey: "encrypted_key_123"
         },
         analytics: {
           enabled: true,
           provider: "google_analytics",
           trackingId: "GA-123456789"
         }
       },
       security: {
         encryption: "AES-256",
         accessControl: "role_based",
         auditLogging: true
       }
     }
   }
 ],

 // Performance Metrics
 metrics: {
   totalCalls: 1247,
   satisfaction: 98, // percentage
   avgResponseTime: 0.3, // seconds
   dailyStats: {
     "2025-07-07": {
       calls: 87,
       satisfaction: 97,
       avgResponseTime: 0.32
     },
     "2025-07-06": {
       calls: 102,
       satisfaction: 99,
       avgResponseTime: 0.28
     }
   },
   weeklyTrends: [
     { week: "2025-W27", calls: 645, satisfaction: 98.2 },
     { week: "2025-W26", calls: 602, satisfaction: 97.8 }
   ]
 },

 // System Status
 systemStatus: {
   totalAgents: 6,
   activeAgents: 6,
   agentGroups: 2,
   operationalStatus: "operational",
   uptime: "99.9%",
   lastMaintenance: "2025-07-01T02:00:00Z",
   nextMaintenance: "2025-08-01T02:00:00Z"
 },

 // Agent Groups
 agentGroups: [
   {
     id: "group-001",
     name: "Customer Service",
     description: "Handles customer inquiries and support",
     agents: ["router-agent-001", "support-agent-001"],
     status: "active"
   },
   {
     id: "group-002", 
     name: "Sales Team",
     description: "Manages sales inquiries and lead qualification",
     agents: ["sales-agent-001", "sales-agent-002"],
     status: "active"
   }
 ],

 // Configuration History
 configurationHistory: [
   {
     id: "config-001",
     timestamp: "2025-07-07T10:30:00Z",
     user: "admin@company.com",
     changes: [
       {
         field: "personality.sliders.formality",
         oldValue: 75,
         newValue: 80
       }
     ],
     description: "Increased formality setting"
   },
   {
     id: "config-002",
     timestamp: "2025-07-06T14:20:00Z", 
     user: "admin@company.com",
     changes: [
       {
         field: "personality.traits",
         oldValue: ["analytical", "efficient"],
         newValue: ["analytical", "efficient", "neutral"]
       }
     ],
     description: "Added neutral personality trait"
   }
 ],

 // Test Configuration
 testing: {
   testCases: [
     {
       id: "test-001",
       input: "Hello, I need help with my account",
       expectedResponse: "Hello! I'd be happy to help you with your account. Could you please provide me with your account number or email address?",
       lastRun: "2025-07-07T10:00:00Z",
       status: "passed"
     }
   ],
   testResults: {
     totalTests: 25,
     passed: 24,
     failed: 1,
     lastRunTime: "2025-07-07T10:00:00Z"
   }
 },

 // User Interface State
 uiState: {
   activeTab: "personality",
   selectedAgent: "router-agent-001",
   colorThemeOptions: [
     "#8B5CF6", "#3B82F6", "#10B981", "#EF4444",
     "#F59E0B", "#6366F1", "#6B7280", "#A855F7"
   ],
   iconOptions: [
     { id: "bot", label: "Bot" },
     { id: "message", label: "Message" },
     { id: "settings", label: "Settings" },
     { id: "zap", label: "Zap" }
   ],
   communicationToneOptions: [
     "Professional",
     "Casual", 
     "Friendly",
     "Formal",
     "Conversational"
   ]
 },

 // API Configuration
 api: {
   baseUrl: "https://api.voiceai.platform.com",
   version: "v2.1",
   rateLimits: {
     requestsPerMinute: 1000,
     requestsPerHour: 10000
   },
   authentication: {
     type: "bearer_token",
     tokenExpiry: 3600 // seconds
   }
 },

 // Deployment Information
 deployment: {
   region: "us-east-1",
   environment: "production",
   instances: 3,
   loadBalancer: "active",
   autoScaling: {
     enabled: true,
     minInstances: 2,
     maxInstances: 10,
     targetCPU: 70
   }
 }
};

// Export configuration for use in applications
export default voiceAIPlatformData;

// Helper functions for data manipulation
export const dataHelpers = {
 // Get agent by ID
 getAgent: (agentId) => {
   return voiceAIPlatformData.agents.find(agent => agent.id === agentId);
 },

 // Update agent personality
 updateAgentPersonality: (agentId, personalityUpdate) => {
   const agent = voiceAIPlatformData.agents.find(a => a.id === agentId);
   if (agent) {
     agent.personality = { ...agent.personality, ...personalityUpdate };
     // Add to configuration history
     voiceAIPlatformData.configurationHistory.unshift({
       id: `config-${Date.now()}`,
       timestamp: new Date().toISOString(),
       user: "system",
       changes: [{ field: "personality", newValue: agent.personality }],
       description: "Updated agent personality"
     });
   }
 },

 // Get performance metrics for date range
 getMetricsForRange: (startDate, endDate) => {
   const dailyStats = voiceAIPlatformData.metrics.dailyStats;
   const filteredStats = {};
   
   Object.keys(dailyStats).forEach(date => {
     if (date >= startDate && date <= endDate) {
       filteredStats[date] = dailyStats[date];
     }
   });
   
   return filteredStats;
 },

 // Export configuration
 exportConfiguration: (agentId) => {
   const agent = voiceAIPlatformData.agents.find(a => a.id === agentId);
   if (agent) {
     return {
       agent: agent,
       exportedAt: new Date().toISOString(),
       version: voiceAIPlatformData.system.version
     };
   }
   return null;
 }
};