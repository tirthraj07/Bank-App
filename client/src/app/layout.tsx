import NavBar from "@/components/navbar"

export const metadata = {
  title: 'Bank App',
  description: 'Created by Tirthraj Mahajan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  

  return (
    <html lang="en">
      <body>
        <NavBar />

        {children}
        
        </body>
    </html>
  )
}
