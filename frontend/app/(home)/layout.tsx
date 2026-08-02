import SiteHeader from "@/components/site-header"

export default function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
