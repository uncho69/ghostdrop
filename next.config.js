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
          // 🛡️ Content Security Policy - Prevent XSS/injection attacks
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Needed for Next.js
              "style-src 'self' 'unsafe-inline'", // Needed for Tailwind
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss:", // WebSocket for dev server
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          
          // 🔐 Force HTTPS in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
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
              'fullscreen=(self)'
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
      
      // 🔒 Extra protection for API routes
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations for crypto operations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false, // Use WebCrypto API instead
      };
    }
    
    // Production security
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize = true;
    }
    
    return config;
  },

  // 🛡️ Environment security
  env: {
    GHOST_VERSION: '1.0.0',
    SECURITY_LEVEL: 'ENTERPRISE'
  }
};

module.exports = nextConfig; 