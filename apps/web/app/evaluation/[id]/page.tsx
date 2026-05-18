import { ScoreCard } from "@/components/eval/ScoreCard";
import { FeedbackPanel } from "@/components/eval/FeedbackPanel";

export default function EvaluationPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ScoreCard reviewId={params.id} />
      <FeedbackPanel reviewId={params.id} />
    </div>
  );
}
