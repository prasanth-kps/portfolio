"use client";
import { forwardRef } from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "100%",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "clamp(1.5rem, 5vw, 4rem)",
          paddingRight: "clamp(1.5rem, 5vw, 4rem)",
        }}
        className={className}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
