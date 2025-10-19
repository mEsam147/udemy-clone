import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Udemy Clone",
  description: "Get in touch with our team. We're here to help with any questions or concerns.",
  openGraph: {
    title: "Contact Us | Udemy Clone",
    description: "Get in touch with our team. We're here to help with any questions or concerns.",
    type: "website",
    locale: "en_US",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
    siteName: "Udemy Clone",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Contact Us",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Udemy Clone",
    description: "Get in touch with our team. We're here to help with any questions or concerns.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Contact() {
  return <ContactClient />;
}
