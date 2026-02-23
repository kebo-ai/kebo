"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface FAQ {
  question: string
  answer: string
}

interface FAQsContentProps {
  faqs: FAQ[]
  title: string
  notFound: string
  contactUs: string
  lang: string
}

export default function FAQsContent({
  faqs,
  title,
  notFound,
  contactUs,
  lang,
}: FAQsContentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-foreground mb-12">
          {title}
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-foreground">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">{notFound}</p>
          <Link
            href={`/${lang}/contacto`}
            className="mt-4 inline-block text-primary hover:text-primary/80 font-medium"
          >
            {contactUs}
          </Link>
        </div>
      </div>
    </div>
  )
}
