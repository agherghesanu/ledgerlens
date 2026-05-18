// Displays the AI-generated case content and questions
export function AICard({ caseId }: { caseId: string }) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-xs text-gray-400 mb-2">AI-generated case · ID {caseId}</p>
      {/* TODO: fetch case, render narrative + questions */}
    </div>
  );
}
