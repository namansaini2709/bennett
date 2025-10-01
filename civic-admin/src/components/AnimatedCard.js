import React from 'react';
import { Card } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const AnimatedCard = ({ children, delay = 0, ...props }) => {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      {...props}
    >
      {children}
    </MotionCard>
  );
};

export default AnimatedCard;