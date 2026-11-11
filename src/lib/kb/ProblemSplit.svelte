<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { splitTicket, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const misTagged = $derived(split.groups.reduce((n, g) => n + g.misTagged, 0));
  const tags = (g: { taggedAs: Record<string, number> }) =>
    Object.entries(g.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const label: Record<Problem, string> = {
    parser: 'parser reads month first',
    hint: 'booking-v3 hint shows MM/DD/YYYY',
    'day-shift': 'one day off, month right',
    unplaced: 'no cause on file',
  };
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports in #{ticket} ({split.rows} rows exported,
  {split.duplicates} of them a report that came twice) ·
  <strong>{split.groups.length}</strong> problems · intake tagged <strong>{misTagged}</strong> of them wrong
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {label[g.problem]}</td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g)}</td>
        <td title={g.tenants.join(', ')}>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.05rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
