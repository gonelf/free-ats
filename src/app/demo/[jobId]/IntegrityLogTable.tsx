import type { IntegrityEvent } from "./types";

export function IntegrityLogTable({ events }: { events: IntegrityEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-400">
        No integrity events logged
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Q#
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Event
            </th>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Severity
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {events.map((ev, i) => (
            <tr key={i}>
              <td className="px-4 py-2.5 font-mono text-slate-500">{ev.timeRemaining}</td>
              <td className="px-4 py-2.5 text-slate-500">{ev.questionNum}</td>
              <td className="px-4 py-2.5 text-slate-700">{ev.description}</td>
              <td className="px-4 py-2.5">
                <span
                  className={`capitalize text-xs font-semibold ${
                    ev.severity === "high"
                      ? "text-red-500"
                      : ev.severity === "medium"
                      ? "text-amber-500"
                      : "text-slate-400"
                  }`}
                >
                  {ev.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
