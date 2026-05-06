import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SEO = ({
  title = 'First Choice Education - Master the GCE',
  description = 'Expert video solutions for GCE past papers. Join Cameroon\'s #1 e-learning platform for Ordinary and Advanced Level students.',
  keywords = 'GCE Cameroon, O-Level, A-Level, Past Papers, Video Solutions, First Choice Education',
  author = 'First Choice Education',
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogImage = '/og-image.png',
  ogUrl = window.location.href,
}: SEOProps) => {
  const siteTitle = title === 'First Choice Education - Master the GCE' 
    ? title 
    : `${title} | First Choice Education`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={ogDescription || description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle || siteTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={ogTitle || siteTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
