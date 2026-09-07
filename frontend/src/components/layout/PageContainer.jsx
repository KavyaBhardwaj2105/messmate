import React from 'react';
import { motion } from 'framer-motion';

const PageContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${className}`}
    >
      {children}
    </motion.main>
  );
};

export default PageContainer;
