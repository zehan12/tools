import { useLocation } from "react-router-dom"
import { env } from "@/env"

interface SEOProps {
  title?: string
  description?: string
  image?: string
}

export function SEO({
  title = "Developer Tools",
  description = "A collection of useful developer tools that run entirely in your browser. Your data never leaves your device.",
  image = "/favicon.svg"
}: SEOProps) {
  const location = useLocation()
  
  const domain = env.VITE_DOMAIN
  const url = `${domain}${location.pathname}`
  
  const formattedTitle = title === "Developer Tools" ? title : `${title} | Developer Tools`

  return (
    <>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${domain}${image}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${domain}${image}`} />
    </>
  )
}
