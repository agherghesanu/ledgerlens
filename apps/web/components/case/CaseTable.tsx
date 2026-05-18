import { Chip } from "@/components/ui/Chip";
import type { Case } from "@ledgerlens/types";

export function CaseTable({ cases = [] }: { cases?: Case[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-gray-500">
          <th className="py-2 pr-4">Case</th>
          <th className="py-2 pr-4">Domain</th>
          <th className="py-2 pr-4">Difficulty</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c) => (
          <tr key={c.id} className="border-b hover:bg-gray-50">
            <td className="py-3 pr-4 font-medium">{c.title}</td>
            <td className="py-3 pr-4">{c.domain}</td>
            <td className="py-3 pr-4">{c.difficulty}</td>
            <td className="py-3">
              <Chip label={c.status} variant={c.status === "completed" ? "success" : "default"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
