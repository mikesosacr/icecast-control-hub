
import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  heading: string;
  text?: string;
  children?: ReactNode;
}

export function PageHeader({ heading, text, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
      <Separator />
    </div>
  );
}
