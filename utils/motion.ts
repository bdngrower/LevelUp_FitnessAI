import { Variants } from 'framer-motion';

// Configuração para acessibilidade (redução de movimento)
export const transition = { type: "spring", stiffness: 300, damping: 30 };

export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 10,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    filter: 'blur(4px)',
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

export const containerStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const buttonTap = { scale: 0.96 };
export const buttonHover = { scale: 1.02, transition: { duration: 0.2 } };

export const cardHover = { 
  y: -4, 
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" 
};
