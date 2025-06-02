import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { LucideProps } from "lucide-react";

export type LucideIconName = keyof typeof dynamicIconImports;

interface DynamicLucideIconProps extends LucideProps {
  name: LucideIconName;
}

const DynamicLucideIcon = ({ name, ...props }: DynamicLucideIconProps) => {
  if (!dynamicIconImports[name]) {
    console.warn(`Lucide icon "${name}" not found. Rendering default or null.`);

    const DefaultIcon = dynamic(dynamicIconImports);
    return <DefaultIcon {...props} />;
  }
  const LucideIcon = dynamic(dynamicIconImports[name]);
  return <LucideIcon {...props} />;
};

export default DynamicLucideIcon;
