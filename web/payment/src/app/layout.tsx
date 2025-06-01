import "@unocss/reset/tailwind.css";

import "./index.css";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className="fixed inset-0 flex flex-col space-y-4 dark:bg-dark-900 dark:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
