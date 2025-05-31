import React from "react";

interface OrderDetailSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const OrderDetailSection: React.FC<OrderDetailSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <section className={`mb-5 ${className}`}>
      <h2 className="text-lg md:text-xl font-semibold mb-2 border-b border-border pb-1 text-foreground">
        {title}
      </h2>
      <div className="text-sm md:text-base text-muted-foreground space-y-1">
        {children}
      </div>
    </section>
  );
};

export default OrderDetailSection;
