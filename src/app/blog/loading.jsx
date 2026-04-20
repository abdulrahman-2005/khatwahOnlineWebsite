/**
 * Loading state for blog page
 * Matches Khatwah brand design
 */
export default function BlogLoading() {
  return (
    <main className="relative w-full bg-background">
      {/* Background decoration */}
      <div className="absolute -right-20 top-0 h-96 w-96 bg-primary opacity-[0.03] blur-[100px] rounded-full" />

      {/* Hero Section Skeleton */}
      <section className="relative w-full px-6 py-24 sm:py-32 lg:py-40 lg:px-20 overflow-hidden">
        <div className="mx-auto max-w-7xl relative">
          <div className="mb-16">
            {/* Eyebrow skeleton */}
            <div className="mb-8">
              <div className="h-4 w-32 bg-surface animate-pulse rounded" />
            </div>
            {/* Title skeleton */}
            <div className="h-24 w-full max-w-3xl bg-surface animate-pulse rounded mb-6" />
            {/* Description skeleton */}
            <div className="space-y-3 max-w-2xl">
              <div className="h-6 w-full bg-surface animate-pulse rounded" />
              <div className="h-6 w-3/4 bg-surface animate-pulse rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid Skeleton */}
      <section className="relative w-full px-6 pb-24 sm:pb-32 lg:pb-40 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="relative block w-full overflow-hidden rounded-[40px] border border-border-dark bg-ink"
              >
                {/* Image Skeleton */}
                <div className="aspect-4/3 bg-surface animate-pulse" />
                
                {/* Content Skeleton */}
                <div className="p-8">
                  <div className="h-3 w-24 bg-surface animate-pulse rounded mb-4" />
                  <div className="h-8 w-full bg-surface animate-pulse rounded mb-2" />
                  <div className="h-8 w-3/4 bg-surface animate-pulse rounded mb-4" />
                  <div className="h-4 w-full bg-surface animate-pulse rounded mb-2" />
                  <div className="h-4 w-5/6 bg-surface animate-pulse rounded mb-6" />
                  <div className="h-4 w-32 bg-surface animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
