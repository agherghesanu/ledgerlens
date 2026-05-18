"use client";

// Submit / save draft controls for case review
export function ActionBar({ caseId }: { caseId: string }) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <button className="px-4 py-2 text-sm border rounded-md">Save draft</button>
      <button className="px-4 py-2 text-sm bg-primary text-white rounded-md">Submit review</button>
    </div>
  );
}
