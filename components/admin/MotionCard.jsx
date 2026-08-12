'use client';

import { motion } from 'framer-motion';

export default function MotionCard({ children, delay = 0, color = '#ffffff' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: `0px 10px 30px -10px ${color}40`,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.96 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
