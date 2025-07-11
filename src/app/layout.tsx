import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import QueryProvider from '@/components/QueryProvider';
import { GridVideoMuteProvider } from '@/contexts/GridVideoMuteContext';

export const metadata = {
  title: 'Memex',
  description: 'Your Triage Dashboard',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ThemeProvider>
            <GridVideoMuteProvider>
              {children}
            </GridVideoMuteProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
