import type { PropsWithChildren } from 'react';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

interface StaggerContainerProps extends PropsWithChildren {
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  inView = false,
}: StaggerContainerProps) {
  const variants = {
    ...containerVariants,
    show: {
      ...containerVariants.show,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const motionProps = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } }
    : { initial: 'hidden', animate: 'show' };

  return (
    <motion.div variants={variants} {...motionProps} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export { containerVariants, itemVariants };
