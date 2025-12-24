'use client'

import { motion } from 'framer-motion'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

interface FeatureHighlightsProps {
  features: Feature[]
}

export default function FeatureHighlights({ features }: FeatureHighlightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut"
          }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-gray-800 p-3 bg-gray-50 rounded-full">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 