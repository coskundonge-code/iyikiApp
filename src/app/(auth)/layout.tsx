"use client";

import { motion } from "framer-motion";

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 aurora-bg" />

      {/* Floating orbs */}
      <FloatingOrb className="w-72 h-72 bg-rose-300 -top-20 -left-20" delay={0} />
      <FloatingOrb className="w-96 h-96 bg-amber-200 -bottom-32 -right-32" delay={2} />
      <FloatingOrb className="w-64 h-64 bg-violet-200 top-1/3 -right-16" delay={4} />
      <FloatingOrb className="w-48 h-48 bg-pink-200 bottom-1/4 -left-12" delay={1} />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
