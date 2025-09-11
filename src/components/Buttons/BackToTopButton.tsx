'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

export const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="fixed bottom-6 right-6 z-[1000] rounded-full shadow-lg border border-white/30 bg-white/20 backdrop-blur-lg"
                >
                    <Tooltip title="Voltar ao topo" placement="left">
                        <Button
                            type="default" 
                            shape="circle"
                            icon={<ArrowUpOutlined className="!text-xl" />}
                            size="large"
                            onClick={scrollToTop}
                            className="!w-14 !h-14 !bg-transparent !border-none"
                            aria-label="Voltar ao topo da página"
                        />
                    </Tooltip>
                </motion.div>
            )}
        </AnimatePresence>
    );
};