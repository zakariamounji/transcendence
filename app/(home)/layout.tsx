import Presence from "@/components/presence"

export default function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element {
  return (
    <>
      {children}
      <Presence />
    </>
  )
}