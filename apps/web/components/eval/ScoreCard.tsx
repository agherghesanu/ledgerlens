// Displays total score and per-dimension breakdown
export function ScoreCard({ reviewId }: { reviewId: string }) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="font-semibold mb-4">Score</h2>
      {/* TODO: fetch score for reviewId, render gauge + dimension bars */}
    </div>
  );
}
