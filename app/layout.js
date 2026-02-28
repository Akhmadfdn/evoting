import "./globals.css";

export const metadata = {
  title: "E-Voting | Pemilihan Umum Organisasi Pemuda",
  description: "Sistem e-voting digital untuk pemilihan umum organisasi pemuda. Transparan, aman, dan real-time.",
  keywords: "e-voting, pemilu, pemilihan umum, organisasi pemuda, voting online",
  openGraph: {
    title: "E-Voting | Pemilihan Umum Organisasi Pemuda",
    description: "Sistem e-voting digital untuk pemilihan umum organisasi pemuda.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
