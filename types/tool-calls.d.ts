// data: {"type": "memory_call", "tool": "retrieve_memory", "args": {"query": "vacation preferences", "user_id": "alice@sentient.ai"}}

// data: {"type": "memory_result", "tool": "retrieve_memory", "output": "{\n  \"results\": [\n    {\n      \"id\": \"52e6c072-87d5-407f-967d-8e656505a826\",\n      \"memory\": \"Loves sky diving\",\n      \"hash\": \"835fe4679facdb8c738fc6245c2372b2\",\n      \"metadata\": {\n        \"category\": \"preferences\"\n      },\n      \"score\": 0.24841186,\n      \"created_at\": \"2025-07-20T04:51:46.300992-07:00\",\n      \"updated_at\": null,\n      \"user_id\": \"alice@sentient.ai\"\n    },\n    {\n      \"id\": \"694b2059-0fe0-48d1-a6b6-a835a1a6bf75\",\n      \"memory\": \"Likes eating seafood\",\n      \"hash\": \"9cfcad9f142ae4f480fc539671b011ba\",\n      \"metadata\": {\n        \"category\": \"preferences\"\n      },\n      \"score\": 0.2233449,\n      \"created_at\": \"2025-07-22T06:11:44.264578-07:00\",\n      \"updated_at\": null,\n      \"user_id\": \"alice@sentient.ai\"\n    },\n    {\n      \"id\": \"5706b768-b478-4572-9292-70523bc35a1e\",\n      \"memory\": \"Favourite food is Pizza\",\n      \"hash\": \"67394110ad44829ddeb70773e65b6ca2\",\n      \"metadata\": {\n        \"category\": \"preferences\"\n      },\n      \"score\": 0.19947745,\n      \"created_at\": \"2025-07-20T04:51:46.276288-07:00\",\n      \"updated_at\": null,\n      \"user_id\": \"alice@sentient.ai\"\n    }\n  ],\n  \"relations\": []\n}"}

// Memory system data types

interface MemoryMetadata {
    category: string
    [key: string]: any // Allow additional metadata fields
}

interface MemoryItem {
    id: string
    memory: string
    hash: string
    metadata: MemoryMetadata
    score: number
    created_at: string // ISO 8601 datetime string
    updated_at: string | null
    user_id: string
}

interface MemoryRelation {
    // Structure not shown in provided data, but included for completeness
    [key: string]: any
}

interface MemoryResult {
    results: MemoryItem[]
    relations: MemoryRelation[]
}

// Memory tool call types
interface MemoryCallArgs {
    query: string
    user_id: string
}

interface MemoryCall {
    type: 'memory_call'
    tool: 'retrieve_memory'
    args: MemoryCallArgs
}

interface MemoryResponse {
    type: 'memory_result'
    tool: 'retrieve_memory'
    output: string // JSON string that should be parsed to MemoryResult
}

// Parsed memory response
interface ParsedMemoryResponse {
    type: 'memory_result'
    tool: 'retrieve_memory'
    output: MemoryResult
}

// Union type for all memory-related messages
type MemoryMessage = MemoryCall | MemoryResponse | ParsedMemoryResponse
