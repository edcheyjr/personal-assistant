import { useThemeColor } from '@/providers/color-theme-provider'
import { Brain, ChevronDown, ChevronRight, Database } from 'lucide-react'
import { useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

const MemoryOperationsDisplay: React.FC<{ operations: MemoryRelation[] }> = ({
    operations,
}) => {
    const [expandedOperations, setExpandedOperations] = useState<Set<number>>(
        new Set()
    )
    const { themeColor } = useThemeColor()

    if (!operations || operations.length === 0) {
        return null
    }

    const toggleOperation = (index: number) => {
        const newExpanded = new Set(expandedOperations)
        if (newExpanded.has(index)) {
            newExpanded.delete(index)
        } else {
            newExpanded.add(index)
        }
        setExpandedOperations(newExpanded)
    }

    return (
        <div className="mt-3 space-y-2">
            {operations.map((operation, index) => {
                const isExpanded = expandedOperations.has(index)
                const isStoring = operation.type === 'add_message_to_memory'

                return (
                    <Collapsible
                        key={index}
                        open={isExpanded}
                        onOpenChange={() => toggleOperation(index)}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-card"
                    >
                        <CollapsibleTrigger className="w-full px-3 py-2 flex items-center gap-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-t-lg">
                            {isExpanded ? (
                                <ChevronDown className="size-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="size-4 text-gray-500" />
                            )}
                            {isStoring ? (
                                <Database className="size-4 text-blue-500" />
                            ) : (
                                <Brain className="size-4 text-green-500" />
                            )}
                            <span className="font-medium">
                                {isStoring
                                    ? 'Stored to Memory'
                                    : 'Retrieved from Memory'}
                            </span>
                            {isStoring &&
                                operation.result?.status === 'success' && (
                                    <span className="ml-auto text-xs text-green-600 dark:text-green-400">
                                        ✓ Saved
                                    </span>
                                )}
                        </CollapsibleTrigger>

                        <CollapsibleContent className="px-3 pb-3 space-y-2 text-sm">
                            {isStoring ? (
                                <div className="space-y-1">
                                    <div className="text-gray-600 dark:text-gray-300">
                                        <strong>Information stored:</strong>
                                    </div>
                                    <div className="bg-white dark:bg-gray-900 p-2 rounded border text-gray-800 dark:text-gray-200">
                                        {operation.args?.content ||
                                            'No content'}
                                    </div>
                                    {operation.args?.category && (
                                        <div className="text-xs text-gray-500">
                                            Category: {operation.args.category}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="text-gray-600 dark:text-gray-300 mb-2">
                                        <strong>Query:</strong>{' '}
                                        {operation.args?.query || 'Unknown'}
                                    </div>
                                    {operation.result?.results && (
                                        <div>
                                            <div className="text-gray-600 dark:text-gray-300 mb-1">
                                                <strong>Found memories:</strong>
                                            </div>
                                            <div className="space-y-1">
                                                {operation.result.results
                                                    .slice(0, 3)
                                                    .map(
                                                        (
                                                            result: any,
                                                            idx: number
                                                        ) => (
                                                            <div
                                                                key={idx}
                                                                className="bg-white dark:bg-gray-900 p-2 rounded border text-gray-800 dark:text-gray-200 text-xs"
                                                            >
                                                                <div>
                                                                    {
                                                                        result.memory
                                                                    }
                                                                </div>
                                                                {result.metadata
                                                                    ?.category && (
                                                                    <div className="text-gray-500 mt-1">
                                                                        Category:{' '}
                                                                        {
                                                                            result
                                                                                .metadata
                                                                                .category
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                {operation.result.results
                                                    .length > 3 && (
                                                    <div className="text-xs text-gray-500">
                                                        +
                                                        {operation.result
                                                            .results.length -
                                                            3}{' '}
                                                        more memories
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                )
            })}
        </div>
    )
}

export default MemoryOperationsDisplay
