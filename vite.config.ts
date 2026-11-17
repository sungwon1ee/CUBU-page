import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 세 페이지(/, /privacy/, 초대 링크가 여는 /r/)를 각각 정적 HTML로 내보낸다. 어떤 정적 호스팅에 올려도 주소가 그대로 열린다.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: "index.html", privacy: "privacy/index.html", invite: "r/index.html" },
    },
  },
});
