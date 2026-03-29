export const metadata = {
  title: 'ChileOK — Ciudadanos por Chile limpio',
  description: 'Reporta puntos críticos de basura y exige cuentas a municipalidades y autopistas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
