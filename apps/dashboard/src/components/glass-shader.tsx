"use client"

import { GrainGradient } from "@paper-design/shaders-react"

export function GlassShader() {
  return (
    <div className="absolute inset-0">
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack="hsl(0, 0%, 0%)"
        softness={0.76}
        intensity={0.45}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={1}
        colors={["hsl(270, 70%, 50%)", "hsl(280, 80%, 65%)", "hsl(260, 90%, 40%)"]}
      />
    </div>
  )
}
