import './globals.css';
import Attribution from '@/components/Attribution';

export const metadata = {
  title: 'Ahsan Ijaz Nursery Farm — Plants delivered in Lahore',
  description:
    'Ahsan Ijaz Nursery Farm, Shadab Colony Lahore. Healthy indoor & outdoor plants, pots, seeds and soil delivered across Lahore with Cash on Delivery. Rated 4.9★ on Google.',
};

export const viewport = { themeColor: '#1E4D2B' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}<Attribution /></body>
    </html>
  );
}
