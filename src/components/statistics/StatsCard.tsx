
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value?: string | number;
  icon: ReactNode;
  description?: string | ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  valueClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  valueClassName
}: StatsCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-sm", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1 truncate">
          {value !== undefined ? (
            <span className={cn(valueClassName)}>{value}</span>
          ) : (
            <Skeleton className="h-8 w-20" />
          )}
        </div>
        <div className="flex items-center text-xs">
          {trend && (
            <div className={cn(
              "flex mr-1",
              trend === "up" && "text-icecast-success",
              trend === "down" && "text-icecast-danger",
              trend === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              )}
              {trend === "down" && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              )}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
          {description && (
            typeof description === 'string' ? 
              <span className="text-muted-foreground">{description}</span> : 
              description
          )}
        </div>
      </CardContent>
    </Card>
  );
}
