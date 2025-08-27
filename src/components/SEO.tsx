import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
  image?: string;
  keywords?: string;
  url?: string;
}

const SEO = ({
  title,
  description = "Ace your interviews with AI-powered preparation. Practice real-world coding, DSA, and behavioral questions.",
  name = "InterviewX",
  type = "website",
  image = "https://interviewx.tech/og-image.png",
  keywords = "interview preparation, AI interview, react interview questions, dsa questions, mock interviews",
  url = "https://interviewx.tech",
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Harsha Vardhan" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
