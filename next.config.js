/** 
 * 🛡️ GHOSTDROP - ENTERPRISE SECURITY CONFIGURATION
 * Zero-knowledge file sharing with military-grade security headers
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false, // Hide Next.js signature for security
  
  // 🔒 Enterprise-grade security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // 🛡️ Content Security Policy - Maximum security
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval'", // Minimal unsafe-eval for Next.js runtime
              "style-src 'self' 'unsafe-inline'", // Required for Tailwind CSS
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'", // Removed WebSocket for production
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
              "block-all-mixed-content"
            ].join('; ')
          },
          
          // 🔐 Force HTTPS in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          
          // 🚫 Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          
          // 🛡️ XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          
          // 📋 Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          
          // 🚫 Disable referrer for privacy
          {
            key: 'Referrer-Policy',
            value: 'no-referrer'
          },
          
          // 🔒 Permissions policy - Disable dangerous features
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'speaker=()',
              'fullscreen=(self)',
              'autoplay=()',
              'encrypted-media=()',
              'picture-in-picture=()'
            ].join(', ')
          },
          
          // 🚫 Remove server signatures
          {
            key: 'Server',
            value: 'GHOSTDROP-SECURE'
          },
          
          // 🔐 Cross-Origin policies for security
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none' // Required for crypto operations
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          }
        ]
      },
      
      // 🔒 Extra protection for API routes - No caching + CORS restrictions
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      },

      // 🛡️ Security headers for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },

  // 🚀 Production optimizations
  async rewrites() {
    return [];
  },

  // 🔐 Security-focused webpack config
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // Client-side optimizations for crypto operations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false, // Use WebCrypto API instead
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Production security optimizations
    if (!dev) {
      config.optimization.minimize = true;
      // Remove console.log in production
      config.optimization.minimizer = config.optimization.minimizer || [];
    }
    
    return config;
  },

  // 🛡️ Environment security
  env: {
    GHOST_VERSION: '2.0.0',
    SECURITY_LEVEL: 'ENTERPRISE'
  },

  // 🔒 Experimental security features
  experimental: {
    serverComponentsExternalPackages: ['redis']
  }
};

module.exports = nextConfig; 