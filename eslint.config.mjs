import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next.config.js",
      "tailwind.config.js",
      "postcss.config.js",
    ],
  },
]

export default config
