/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

// Khai báo kiểu dữ liệu cho JSX Runtime để tránh báo lỗi trong môi trường không có tsconfig.json
declare module 'react/jsx-runtime' {
  const content: any;
  export default content;
}

declare module 'react/jsx-dev-runtime' {
  const content: any;
  export default content;
}
