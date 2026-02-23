interface PolicyContentProps {
    content: string
}

export default function PolicyContent({ content }: PolicyContentProps) {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
            <article className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">
                    {content}
                </div>
            </article>
        </div>
    )
}
