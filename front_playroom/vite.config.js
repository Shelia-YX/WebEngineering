import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // 添加别名以解决React版本兼容性问题
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  }
})