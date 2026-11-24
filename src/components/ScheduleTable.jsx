function indexOfSlot(slots, value) {
  return slots.indexOf(value);
}

function renderHourlyTable(schedule) {
  const { slots, blocks, columns } = schedule;
  const rows = [];
  const blocksByStart = new Map();
  blocks.forEach((block) => {
    const list = blocksByStart.get(block.start) || [];
    list.push(block);
    blocksByStart.set(block.start, list);
  });

  for (let index = 0; index < slots.length; index += 1) {
    const slot = slots[index];
    const starting = blocksByStart.get(slot);
    if (starting?.length) {
      starting.forEach((block, blockIndex) => {
        const endIndex = indexOfSlot(slots, block.end);
        const span =
          blockIndex === 0
            ? endIndex > index
              ? endIndex - index
              : 1
            : 1;
        rows.push(
          <tr key={`block-${slot}-${blockIndex}`}>
            {blockIndex === 0 && <td className="schedule-time">{slot}</td>}
            <td className="schedule-activity" rowSpan={span}>
              <span className="schedule-block-range">
                {block.start} – {block.end}
              </span>
              <span className="schedule-block-label">{block.label}</span>
            </td>
          </tr>
        );
      });
      continue;
    }
    const covered = blocks.some((block) => {
      const startIndex = indexOfSlot(slots, block.start);
      const endIndex = indexOfSlot(slots, block.end);
      return startIndex >= 0 && endIndex > startIndex && index > startIndex && index < endIndex;
    });
    if (covered) continue;
    rows.push(
      <tr key={`free-${slot}`}>
        <td className="schedule-time">{slot}</td>
        <td className="schedule-free">frei</td>
      </tr>
    );
  }
  return (
    <table className="schedule-table hourly">
      <thead>
        <tr>
          {(columns || []).map((column, columnIndex) => (
            <th key={`${column}-${columnIndex}`}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function renderSimpleTable(schedule) {
  return (
    <table className="schedule-table">
      <thead>
        <tr>
          {(schedule.columns || []).map((column, index) => (
            <th key={`${column}-${index}`}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(schedule.rows || []).map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {(schedule.columns || []).map((_, cellIndex) => (
              <td key={`cell-${rowIndex}-${cellIndex}`}>{row[cellIndex] || ""}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ScheduleTable({ schedule, compact = false }) {
  if (!schedule?.columns?.length) return null;
  const hasHourlyGrid =
    Array.isArray(schedule.slots) &&
    schedule.slots.length > 0 &&
    Array.isArray(schedule.blocks) &&
    schedule.blocks.length > 0;
  if (!hasHourlyGrid && !schedule.rows?.length) return null;

  return (
    <div className={`schedule-table-wrap ${compact ? "compact" : ""}`}>
      {schedule.caption && <div className="schedule-table-caption">{schedule.caption}</div>}
      {hasHourlyGrid ? renderHourlyTable(schedule) : renderSimpleTable(schedule)}
    </div>
  );
}
