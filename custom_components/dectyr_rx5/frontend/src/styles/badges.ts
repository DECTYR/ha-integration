import { css } from "lit";

export function rssiBadgeClass(rssi: number | null): string {
  if (rssi === null || Number.isNaN(rssi)) {
    return "rssi-unknown";
  }
  if (rssi >= -60) {
    return "rssi-good";
  }
  if (rssi >= -80) {
    return "rssi-medium";
  }
  return "rssi-poor";
}

export const rssiBadgeStyles = css`
  .rssi-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .rssi-good {
    background: var(--success-color, #4caf50);
    color: white;
  }
  .rssi-medium {
    background: var(--warning-color, #ff9800);
    color: white;
  }
  .rssi-poor {
    background: var(--error-color, #f44336);
    color: white;
  }
  .rssi-unknown {
    background: var(--disabled-color, #999);
    color: white;
  }
`;
