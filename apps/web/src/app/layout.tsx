import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'gRPC 채팅',
  description: 'gRPC-Web + Next.js 학습용 채팅',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
