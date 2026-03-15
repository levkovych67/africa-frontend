interface ProductGridProps {
  children: React.ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8">
      {children}
    </div>
  );
}

export function ProductGridItem({ children }: { children: React.ReactNode }) {
  return (
    <>{children}</>
  );
}
