import { Button } from 'antd'
import React from 'react'

interface ButtonDeleteProps {
    readonly text?: string;
    readonly type?: "primary" | "default" | "dashed" | "text" | "link";
    readonly htmlType?: "submit" | "button" | "reset";
    readonly className?: string;
    readonly disabled?: boolean;
    readonly loading?: boolean;
    readonly danger?: boolean;
    readonly ghost?: boolean;
    readonly shape?: "default" | "circle" | "round";
    readonly size?: "small" | "middle" | "large";
    readonly block?: boolean;
    readonly icon?: React.ReactNode;
    readonly href?: string;
    readonly target?: string;
    readonly rel?: string;    
    readonly onClick?: () => void;
}

export function ButtonDelete(
    {
        text,
        type = "primary",
        htmlType,
        className,
        disabled = false,
        loading = false,
        danger = false,
        ghost = false,
        shape,
        size,
        block = false,
        icon = null,
        href,
        target,
        rel,
        onClick = () => {},
    }: ButtonDeleteProps
) {
    return (
        <Button
            type={type}
            htmlType={htmlType}
            className={`!py-4 bg-red-800 ${!disabled ? "hover:!bg-red-500" : ""} !shadow-none ${className} `}
            disabled={disabled}
            loading={loading}
            danger={danger}
            ghost={ghost}
            shape={shape === "default" ? undefined : shape}
            size={size}
            block={block}
            icon={icon}
            href={href ?? undefined}
            target={target}
            rel={rel}
            onClick={onClick}
        >
            {text}
        </Button>
    )
}
