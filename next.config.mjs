// eslint-disable-next-line import/no-extraneous-dependencies
import nextTranslate from 'next-translate-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextTranslate(nextConfig);
