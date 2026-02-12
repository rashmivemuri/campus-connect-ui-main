import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent/15 to-primary/10 flex items-center justify-center text-accent group-hover:animate-bounce-subtle">
          {icon}
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-card-foreground">{value}</p>
      {trend && <p className="text-xs text-success mt-1">{trend}</p>}
    </motion.div>
  );
}
