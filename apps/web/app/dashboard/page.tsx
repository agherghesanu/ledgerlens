import { CaseTable } from "@/components/case/CaseTable";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Cases</h1>
      <CaseTable />
    </div>
  );
}
