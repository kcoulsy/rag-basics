import { defineConfig, loadEnv } from "vite";
import devServer from "@hono/vite-dev-server";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [
      devServer({
        entry: "src/index.tsx",
      }),
    ],
  };
});
