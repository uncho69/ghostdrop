# 👻 GhostDrop

**Zero-knowledge file sharing with military-grade encryption**

🔗 **Live Demo:** [ghostdrop.org](https://ghostdrop.org)

## 🚀 Quick Deploy to ghostdrop.org

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env.production

# Update with your domain (already configured for ghostdrop.org)
NEXT_PUBLIC_SITE_URL=https://ghostdrop.org
```

### 2. Build & Deploy
```bash
npm install
npm run build
npm start
```

### 3. Admin Panel
Access admin panel at: `https://ghostdrop.org/admin-codes`

## 🛡️ Security Features

- **AES-256-GCM** encryption with PBKDF2 (210k iterations)
- **Zero-knowledge** architecture - server never sees your keys
- **Auto-destruction** after first access or expiry
- **Enterprise-grade** security headers
- **Admin dashboard** with usage analytics

## 🔧 Configuration

The app is pre-configured for **ghostdrop.org** deployment. Just update your Redis credentials in `.env.production`:

```bash
REDIS_URL=your-redis-connection-string
```

## 📊 Features

- ✅ File & text sharing (up to 10MB)
- ✅ Password protection (optional)
- ✅ Custom expiry times
- ✅ Access code system
- ✅ Admin dashboard
- ✅ Mobile responsive
- ✅ PWA ready

## 🏗️ Tech Stack

- **Next.js 14** + React 18 + TypeScript
- **Redis** for secure storage
- **WebCrypto API** for client-side encryption
- **Tailwind CSS** for styling

---

**Built for ghostdrop.org** - Enterprise-grade secure file sharing

## 🔥 Features

- **📁 Messages/Files Encrypted**: Support for both text messages and file uploads with full encryption
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

*Last updated: Force sync with Vercel - Redis TLS fix deployed* 