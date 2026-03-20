export const metadata = {
  title: 'ResearchOS API',
  description: 'Mock backend for ResearchOS',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
