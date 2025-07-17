import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'
import { AgentEvent } from '@/types/message'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export const ThinkingStep: React.FC<{ step: AgentEvent }> = ({ step }) => {
    let stepTypeLabel = step.event || 'Unknown'
    let stepTypeClass = ''
    let icon = '🔄'

    if (step.event === 'on_tool_start' || step.event === 'on_tool_end') {
        stepTypeClass =
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        icon = '🛠️'
    } else if (step.event === 'on_chain_start') {
        stepTypeClass =
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        icon = '⏩'
    } else if (step.event === 'on_chain_end') {
        stepTypeClass =
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        icon = '✅'
    } else if (step.event === 'on_chat_model_start') {
        stepTypeClass =
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        icon = '💭'
    } else if (step.event === 'on_chat_model_stream') {
        stepTypeClass =
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        icon = '✍️'
    }

    return (
        <div className="mb-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span
                        className={`text-xs font-medium px-2 py-1 rounded ${stepTypeClass}`}
                    >
                        {stepTypeLabel}
                    </span>
                    <span className="text-sm font-medium">
                        {step.name || 'Step'}
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>

            {step.data?.input && (
                <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                        Input:
                    </div>
                    <pre className="text-xs bg-card p-2 rounded overflow-x-auto">
                        {JSON.stringify(step.data.input, null, 2)}
                    </pre>
                </div>
            )}

            {step.data?.output && (
                <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                        Output:
                    </div>
                    <pre className="text-xs bg-card p-2 rounded overflow-x-auto">
                        {JSON.stringify(step.data.output, null, 2)}
                    </pre>
                </div>
            )}

            {step.data?.chunk && (
                <div className="mt-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                        Content:
                    </div>
                    <div className="text-sm p-2 bg-card rounded">
                        {step.data.chunk}
                    </div>
                </div>
            )}
        </div>
    )
}

export const ThinkingProcess: React.FC<{ steps: AgentEvent[] }> = ({
    steps,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    if (steps.length === 0) {
        return null
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900n">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>Thinking Process ({steps.length} steps)</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 pl-4 border-l-2">
                <div className="space-y-2">
                    {steps.map((step, index) => (
                        <ThinkingStep key={index} step={step} />
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
