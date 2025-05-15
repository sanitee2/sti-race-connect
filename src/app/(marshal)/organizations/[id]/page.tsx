"use client";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Wait for the params Promise to resolve
  const resolvedParams = await params;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h1 className="text-2xl font-bold mb-4">This page is temporarily unavailable</h1>
      <p className="text-muted-foreground text-center">
        We're currently working on improvements to this feature.
        Please check back soon.
      </p>
    </div>
  );
} 