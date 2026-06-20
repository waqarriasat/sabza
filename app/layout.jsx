import './globals.css';

export const metadata = {
  title: 'Sabza — Plants delivered across Pakistan',
  description:
    'A working nursery, online. Healthy indoor & outdoor plants, pots, seeds and soil delivered across Pakistan with Cash on Delivery.',
};

export const viewport = { themeColor: '#5DA13B' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
