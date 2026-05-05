import { css } from "lit";

/** Shared design tokens for Dectyr Lovelace pieces. */
export const dectyrCardTheme = css`
  :host {
    --dectyr-radius: 12px;
    --dectyr-muted: var(--secondary-text-color);
    --dectyr-border-subtle: 1px solid var(--divider-color);
    --dectyr-live-border: 1px solid var(--success-color, #4caf50);
    --dectyr-offline-border: 1px solid var(--disabled-color, #9e9e9e);
    --dectyr-row-bg: var(--secondary-background-color);
  }
`;
