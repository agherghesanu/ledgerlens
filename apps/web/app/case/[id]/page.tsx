import { AICard } from "@/components/case/AICard";
import { ActionBar } from "@/components/case/ActionBar";

export default function CaseReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
      <AICard caseId={params.id} />
      <ActionBar caseId={params.id} />
    </div>
  );
}
