import { useState } from 'react';
import IslandCard from './IslandCard';

export default function IslandList({ islands }) {
  const [segment, setSegment] = useState('All');
  const displayed = segment === 'All' ? islands : islands.filter((island) => island.segment === segment);
  const sortedDisplayed = [...displayed].sort((leftIsland, rightIsland) =>
    leftIsland.name.localeCompare(rightIsland.name)
  );
  const segments = ['All', ...new Set(islands.map((island) => island.segment))];
  const avgStay = sortedDisplayed.length
    ? (sortedDisplayed.reduce((sum, island) => sum + island.avgStay, 0) / sortedDisplayed.length).toFixed(1)
    : '0.0';

  return (
    <section className="list-section" aria-labelledby="island-list-title">
      <div className="list-header">
        <div>
          <p className="eyebrow">Explore Hawaii</p>
          <h2 id="island-list-title">Island cards by visitor segment</h2>
        </div>
        <label className="filter-label">
          <span>Filter by segment</span>
          <select value={segment} onChange={(event) => setSegment(event.target.value)}>
            {segments.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid">
        {sortedDisplayed.map((island) => (
          <IslandCard key={island.id} {...island} />
        ))}
      </div>

      <aside className="summary-card" aria-live="polite">
        <p className="summary-label">Summary</p>
        <p className="summary-value">Average stay: {avgStay} days</p>
        <p className="summary-note">Calculated from the {sortedDisplayed.length} shown island card{sortedDisplayed.length === 1 ? '' : 's'}.</p>
      </aside>
    </section>
  );
}
