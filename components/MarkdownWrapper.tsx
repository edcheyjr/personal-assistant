import React from 'react'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { MemoizedReactMarkdown } from './markdown'
import { CodeBlock } from '@/components/ui/codeblock'

type Props = { children: string }

export default function MarkdownWrapper({ children }: Props) {
    return (
        <MemoizedReactMarkdown
            // TODO: add more markdown/remark plugins as needed
            remarkPlugins={[remarkGfm, remarkMath, remarkDirective]}
            // TODO: add more html/rehype plugins as needed
            rehypePlugins={[rehypeRaw, rehypeKatex] as any}
            components={{
                p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                },
                code({ node, className, children, ...props }) {
                    if (Array.isArray(children) && children.length) {
                        if (children[0] == '▍') {
                            return (
                                <span className="mt-1 animate-pulse cursor-default">
                                    ▍
                                </span>
                            )
                        }

                        children[0] = (children[0] as string).replace(
                            '`▍`',
                            '▍'
                        )
                    }

                    const match = /language-(\w+)/.exec(className || '')

                    if (match) {
                        return (
                            <CodeBlock
                                key={Math.random()}
                                language={(match && match[1]) || ''}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                            />
                        )
                    }
                    return (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    )
                },
            }}
        >
            {children}
        </MemoizedReactMarkdown>
    )
}
