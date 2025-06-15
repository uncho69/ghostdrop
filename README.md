# 👻 GHOSTDROP

**Secure, ephemeral file & message sharing with zero-knowledge encryption**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uncho69/ghostdrop)

## 🔥 Features

- **🔐 Zero-Knowledge Encryption**: AES-256-GCM encryption happens entirely in your browser
- **💥 Auto-Destruction**: Messages self-destruct after first view or 24h expiry
- **⏱️ Burn After Reading**: Customizable timers with visual countdown (instant, 5s, 30s, 1 minute)
- **🔒 Optional Password Protection**: Add an extra layer of security with custom passwords
- **🚫 No Accounts Required**: Anonymous by default - no tracking, no logs
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🛡️ Enterprise Security**: Military-grade security headers and CSP policies

## 🏗️ Architecture

### Zero-Knowledge Design
- **Client-side encryption**: Data is encrypted before leaving your device
- **URL fragment keys**: Encryption keys travel in URL fragments (#key) - never sent to server
- **Server blindness**: Server receives only encrypted gibberish and cannot decrypt
- **Single-use access**: Unique codes for controlled access to the application

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Redis for storage
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Deployment**: Vercel + Redis Cloud

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set up environment variables:
   - `NEXT_PUBLIC_SITE_URL`: Your domain (e.g., `https://yourdomain.com`)
   - `REDIS_URL`: Your Redis connection string
4. Deploy!

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/uncho69/ghostdrop.git
   cd ghostdrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   REDIS_URL=redis://localhost:6379
   ```

4. **Start Redis** (if running locally)
   ```bash
   redis-server
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your domain URL | Yes | `http://localhost:3000` |
| `REDIS_URL` | Redis connection string | Yes | `redis://localhost:6379` |

## 🛡️ Security Features

- **Content Security Policy**: Prevents XSS and injection attacks
- **HSTS**: Forces HTTPS in production
- **No-referrer policy**: Protects user privacy
- **Frame protection**: Prevents clickjacking
- **MIME type protection**: Prevents content sniffing attacks

## 📖 How It Works

1. **Access Control**: Users need a single-use access code to enter the app
2. **Create Drop**: Upload files or write messages with optional password protection
3. **Client-side Encryption**: Data is encrypted in the browser using AES-256-GCM
4. **Secure Sharing**: Share the generated link containing the encrypted data ID
5. **Zero-Knowledge Retrieval**: Recipients decrypt data client-side using the URL fragment key
6. **Auto-Destruction**: Data is permanently deleted after viewing or expiry

## 🔐 Privacy Guarantees

- **No server-side decryption**: Encryption keys never reach the server
- **No data persistence**: All data auto-deletes after use
- **No user tracking**: No accounts, cookies, or analytics
- **No metadata logging**: Minimal server logs for security only

## 🚨 Important Notes

- **Educational Purpose**: This project is for educational and research purposes
- **Legal Compliance**: Users are responsible for compliance with local laws
- **No Recovery**: Deleted data cannot be recovered - true ephemeral messaging
- **Browser Compatibility**: Requires modern browsers with Web Crypto API support

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## ⚠️ Disclaimer

This software is provided "as is" without warranty. Users assume all responsibility for its use. Not recommended for highly sensitive or classified information without additional security measures.

---

**Built with ❤️ for privacy and security** 