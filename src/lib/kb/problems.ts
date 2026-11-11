// Splits a merged ticket into the problems its reports describe. causes.ts files each report under parser
// or hint from its tenant, and that is how the desk counts. The reports in desk-notes.json (oneDayMove)
// describe a third problem: a day boundary, not a flipped day and month. The desk counts them where they
// are filed and footnotes them, so they also appear as a row of their own.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'day-shift' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  // intake's guess for these reports: tag → count.
  taggedAs: Record<string, number>;
  // reports whose intake tag is not this problem.
  misTagged: number;
  // reports filed here that also describe a one-day shift.
  alsoDayShift: number;
  firstSeen: string;
  lastSeen: string;
};

export type TicketSplit = { rows: number; duplicates: number; merged: Report[]; groups: ProblemGroup[] };

export function splitTicket(
  rows: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): TicketSplit {
  const merged = uniqueById(rows).filter((r) => r.mergedInto === ticket);
  const filed = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p: Problem = causeOf(r, tenantOf(r)) ?? 'unplaced';
    filed.set(p, [...(filed.get(p) ?? []), r]);
  }
  const shifted = merged.filter((r) => oneDayMove.includes(r.id));
  const sets: [Problem, Report[]][] = [...filed.entries(), ...(shifted.length ? [['day-shift', shifted] as [Problem, Report[]]] : [])];
  const groups = sets
    .map(([problem, rs]): ProblemGroup => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        misTagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
        alsoDayShift: problem === 'day-shift' ? 0 : rs.filter((r) => oneDayMove.includes(r.id)).length,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { rows: rows.length, duplicates: rows.length - uniqueById(rows).length, merged, groups };
}
