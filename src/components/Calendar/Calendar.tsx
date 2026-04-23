'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type CalendarProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        path: {
            initial: {
                opacity: 1,
                pathLength: 1,
                pathOffset: 0,
            },
            animate: {
                opacity: [0, 1],
                pathLength: [0, 1],
                pathOffset: [1, 0],
                transition: {
                    duration: 0.8,
                    ease: 'easeInOut',
                    opacity: { duration: 0.01 },
                },
            },
        },
    },
} satisfies Record<string, Variants>;

function IconComponent({ size, ...props }: CalendarProps) {
    const { controls } = useAnimateIconContext();
    const variants = getVariants(animations);

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Calendar outline */}
            <motion.rect
                x="3"
                y="4"
                width="18"
                height="18"
                rx="2"
                variants={variants.path}
                initial="initial"
                animate={controls}
            />

            {/* top pins */}
            <motion.line
                x1="8"
                y1="2"
                x2="8"
                y2="6"
                variants={variants.path}
                initial="initial"
                animate={controls}
            />
            <motion.line
                x1="16"
                y1="2"
                x2="16"
                y2="6"
                variants={variants.path}
                initial="initial"
                animate={controls}
            />

            {/* divider */}
            <motion.line
                x1="3"
                y1="10"
                x2="21"
                y2="10"
                variants={variants.path}
                initial="initial"
                animate={controls}
            />

            {/* 🔥 Pulse dot (ngày active) */}
            <motion.circle
                cx="12"
                cy="15"
                r="1.5"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{
                    duration: 1.5,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />
        </motion.svg>
    );
}

function Calendar(props: CalendarProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    Calendar,
    Calendar as CalendarIcon,
    type CalendarProps,
};