import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 は dev 資産 (/_next/*) への non-localhost からのアクセスを既定でブロックする。
  // LAN IP や同一ネットワーク端末から開くと JS バンドルが届かず Hydrate されないため、
  // ローカルネットワーク (RFC1918 系) を許可しておく
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*'],
};

export default nextConfig;
