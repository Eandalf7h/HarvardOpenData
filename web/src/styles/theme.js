export default {
  colors: {
    text: '#333',
    background: '#aaaaaa',
    primary: '#639',
    secondary: '#ff6347',
    muted: 'eeeeee',
  },
  fonts: {
    body: "Akkurat, system-ui, sans-serif",
    heading: "Akkurat, system-ui, sans-serif",
    monospace: "Akkurat-Mono, Menlo, monospace",
  },
  fontWeights: {
    body: 400,
    heading: 900,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  fontSizes: [
    12, 14, 16, 19, 24, 32, 48, 64, 72,
  ],
  fontWeights: {
    body: 400,
    heading: 900,
    bold: 700,
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512, 960],
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  breakpoints: [
    '40em', '56em', '64em',
  ],
  text: {
    default: {
      color: 'text',
      fontSize: 3,
    },
    caps: {
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
    },
    heading: {
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading',
    },
    caption: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      marginTop: [1.5, 2.5],
      fontSize: [1, 2],
    },
  },
  image: {
    padding: 0,
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 99999,
    },
  },
  link: {
    textDecoration: 'none',
  },
  styles: {
    root: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    p: {
      fontSize: [1, 2, 3],
    },
    h1: {
      variant: 'text.heading',
      fontSize: [5, 6, 7],
    },
    h2: {
      variant: 'text.heading',
      fontSize: [4, 5],
    },
    h3: {
      variant: 'text.heading',
      fontSize: [3, 4],
      marginTop: '0.5em',
    },
  },
}