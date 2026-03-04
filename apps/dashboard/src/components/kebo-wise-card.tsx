"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

const basePath = ""

const sampleQuestions = [
  "How am I doing this month?",
  "Where am I spending the most?",
  "How can I save more?",
]

export function KeboWiseCard() {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Kebo Wise</span>
            <p className="text-muted-foreground/70 text-xs">
              AI Financial Assistant
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-2">
          {sampleQuestions.map((question) => (
            <Link
              key={question}
              href={`${basePath}/chat?q=${encodeURIComponent(question)}`}
              className="block w-full text-left p-3 rounded-lg border hover:bg-muted hover:border-info/30 transition-all text-foreground text-sm"
            >
              {question}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`${basePath}/chat`}
          className="mt-4 flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm font-medium"
        >
          Start a conversation
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
