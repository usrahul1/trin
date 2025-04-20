import Navbar from "./Navbar"
import Footer from "./Footer"

export default function Layout({ children, cartItemCount = 0 }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartItemCount={cartItemCount} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}
