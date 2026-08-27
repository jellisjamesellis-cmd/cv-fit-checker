/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep PDF/DOCX parsers external so the serverless PDF.js build
    // and native-optional deps are not mishandled by the bundler.
    serverComponentsExternalPackages: ["unpdf", "mammoth"],
  },
};

export default nextConfig;
