"use client";

import { Button } from "@/components/ui/button";
import { DivvyCharacter } from "@/components/divvy-character";
import { Camera, Link2, Users } from "lucide-react";
import Link from "next/link";
import * as m from "motion/react-client";

const steps = [
  { icon: Camera, title: "1. Scan", desc: "Take a photo of your receipt" },
  { icon: Link2, title: "2. Share", desc: "Send the link to your group" },
  { icon: Users, title: "3. Claim", desc: "Everyone taps what they had" },
];

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
        {/* Hero */}
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center text-center gap-4 mb-12"
        >
          <m.div
            initial={{ rotate: -12, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <DivvyCharacter size={140} />
          </m.div>
          <m.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-5xl font-display tracking-tight"
          >
            Divvy
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-muted-foreground text-lg max-w-xs"
          >
            Split restaurant bills fairly. Scan, share, claim.
          </m.p>
        </m.div>

        {/* CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.4 }}
          className="w-full max-w-xs"
        >
          <Button asChild size="xl" className="w-full">
            <Link href="/scan">
              <Camera className="w-5 h-5 mr-2" />
              Split a Bill
            </Link>
          </Button>
        </m.div>

        {/* How it works */}
        <div className="mt-16 w-full space-y-6">
          <m.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-medium text-muted-foreground text-center uppercase tracking-wider"
          >
            How it works
          </m.h2>
          <div className="grid gap-4">
            {steps.map((step, i) => (
              <m.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  delay: 0.6 + i * 0.1,
                }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
