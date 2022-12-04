import { css, Global } from '@emotion/react';

export function GlobalStyle() {
  return (
    <Global
      styles={css`
      body {
        font-family: Verdana, Geneva, Tahoma, sans-serif;
      }
      `}
    />
  );
}
