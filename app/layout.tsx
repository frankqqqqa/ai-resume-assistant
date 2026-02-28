import type {Metadata} from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import './globals.css'; // Global styles

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-sc',
});

export const metadata: Metadata = {
  title: 'AI 简历助手 工作台',
  description: 'AI 简历优化工作台',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="zh-CN" className={`${notoSansSC.variable}`}>
      <body className="font-sans antialiased bg-[#FBFBFB] text-[#1d1d1f] min-h-screen flex flex-col selection:bg-[#0071e3] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
