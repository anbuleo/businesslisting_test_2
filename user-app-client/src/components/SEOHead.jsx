import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = 'ServiceHub - Book Local Services Instantly',
  description = 'Book trusted local services like plumbing, electrical, cleaning, and more. Pay only 10% advance, track your service provider in real-time.',
  keywords = 'home services, plumbing, electrical, cleaning, repair, maintenance, local services, service booking',
  image = '/og-image.jpg',
  url = 'https://servicehub.com',
  type = 'website'
}) => {
  const fullTitle = title.includes('ServiceHub') ? title : `${title} | ServiceHub`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="ServiceHub" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ServiceHub" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@servicehub" />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data for Local Business */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "ServiceHub",
          "description": description,
          "url": url,
          "logo": `${url}/logo.png`,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-1234567890",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi"]
          },
          "areaServed": {
            "@type": "Country",
            "name": "India"
          },
          "serviceType": "Home Services",
          "priceRange": "₹₹"
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;