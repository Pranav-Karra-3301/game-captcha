"use client";

import styles from "../page.module.css";

interface TimeRangeSelectorProps {
  selected: string;
  onChange: (range: string) => void;
}

const ranges = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" }
];

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className={styles.filterBar}>
      {ranges.map((range) => (
        <button
          key={range.value}
          className={`${styles.filterButton} ${selected === range.value ? styles.active : ""}`}
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
} 