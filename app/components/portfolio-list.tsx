import type { PortfolioWithBody } from "@/lib/content";
import { PortfolioGrid } from "./portfolio-grid";

export function PortfolioList({ items }: { items: PortfolioWithBody[] }) {
  return <PortfolioGrid items={items} />;
}
