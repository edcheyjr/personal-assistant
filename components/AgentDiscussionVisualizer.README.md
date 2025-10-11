# AgentDiscussionVisualizer Component

A clean, purpose-built React component for visualizing AI agent discussions in real-time.

## Features

✅ **Real-time streaming** - Shows content as it arrives
✅ **Agent tracking** - Automatically switches between agents
✅ **Transfer indicators** - Clear visual cues for agent handoffs
✅ **No duplicates** - Each message shown once
✅ **Auto-scroll** - Follows the conversation
✅ **Unique agent colors** - Easy to distinguish speakers
✅ **Loading states** - Shows when streaming is active
✅ **Error handling** - Gracefully handles parsing errors

## Usage

### Basic Example

```tsx
import AgentDiscussionVisualizer from '@/components/AgentDiscussionVisualizer';

export default function DiscussionPage() {
  return (
    <div className="h-screen">
      <AgentDiscussionVisualizer
        streamUrl="/api/multi-agents/abc123/chat/stream?user_input=Hello&thread_id=xyz"
        onError={(error) => console.error('Stream error:', error)}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
<AgentDiscussionVisualizer
  streamUrl={streamUrl}
  className="max-w-4xl mx-auto"
  onError={handleError}
/>
```

### Integration with Existing Chat

```tsx
const Chat = () => {
  const [streamUrl, setStreamUrl] = useState<string>("");
  
  const handleSendMessage = (message: string) => {
    const url = `/api/multi-agents/${groupId}/chat/stream?` +
      `user_input=${encodeURIComponent(message)}&` +
      `thread_id=${threadId}`;
    setStreamUrl(url);
  };

  return (
    <div className="flex flex-col h-screen">
      {streamUrl && <AgentDiscussionVisualizer streamUrl={streamUrl} />}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `streamUrl` | `string` | Yes | URL to fetch SSE stream from |
| `onError` | `(error: Error) => void` | No | Error callback |
| `className` | `string` | No | Additional CSS classes |

## Supported SSE Events

The component handles these event types:

### Content Events
```json
{"type": "content", "content": "Hello"}
```
Accumulates and displays text content.

### Transfer Events
```json
{"type": "tool_call", "tool": "transfer_to_team_lead_1", "args": {}}
```
Switches to new agent and shows transfer indicator.

### End Events
```json
{"type": "end"}
```
Finalizes the current message.

## Agent Colors

Pre-configured colors for common agents:
- **Supervisor** - Blue
- **Team Lead 1** - Purple
- **Team Lead 2** - Green
- **Peer 1** - Orange
- **Peer 2** - Pink
- **Specialist 1** - Indigo
- **Specialist 2** - Cyan

Unknown agents get a color based on name hash.

## UI Elements

### Agent Avatar
- Circular avatar with agent initials
- Color-coded by agent name
- 40px diameter

### Message Layout
```
[Avatar] Agent Name • 2:30 PM
         Message content appears here
         with proper line wrapping...
```

### Transfer Indicator
```
     → Transferred to Team Lead 1 →
```
- Centered between messages
- Rounded pill shape
- Subtle background

### Streaming Indicator
Shows spinner icon next to agent name when content is streaming.

## How It Works

1. **Initialization**: Starts with "Supervisor" as the current agent
2. **Streaming**: Fetches SSE stream and parses line by line
3. **Content Accumulation**: Builds up message content
4. **Transfer Detection**: Looks for `transfer_to_*` tool calls
5. **Message Finalization**: When transfer occurs or stream ends, finishes message
6. **Visual Update**: Shows completed message and transfer indicator

## No Duplicates

The component ensures no duplicate content by:
- Only showing content as it streams
- Finishing messages when transfers occur
- Not re-displaying content that's already shown
- Ignoring memory operations and tool results (except transfers)

## Performance

- Uses React refs for DOM references
- Minimal re-renders with proper state updates
- Efficient scrolling with smooth behavior
- Cleanup on unmount to prevent memory leaks

## Customization

### Change Agent Colors

Edit the `getAgentColor` function:

```tsx
const colors: Record<string, string> = {
  "Custom Agent": "bg-red-500",
  // Add more...
};
```

### Modify Transfer UI

Update the transfer indicator JSX:

```tsx
{transferAfter && (
  <div className="your-custom-classes">
    {/* Custom transfer UI */}
  </div>
)}
```

### Adjust Avatar Size

Change `size-10` class in avatar divs:

```tsx
<div className="size-12 rounded-full...">
```

## TypeScript Support

Fully typed with TypeScript interfaces:
- `AgentMessage`
- `AgentTransfer`
- `AgentDiscussionVisualizerProps`

## Dependencies

- React 18+
- Tailwind CSS
- lucide-react (for icons)
- Your app's `cn` utility function

## Browser Support

Works in all modern browsers that support:
- Fetch API
- ReadableStream
- TextDecoder
- AbortController

## Known Limitations

- Does not persist messages across remounts
- Single concurrent stream per component instance
- No message history loading

## Future Enhancements

Potential features for future versions:
- Message persistence
- Export conversation
- Search/filter messages
- Collapse/expand agents
- Typing indicators
- Read receipts
- Reaction support
