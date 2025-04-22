import "@unocss/reset/tailwind.css";

import "./index.css";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
