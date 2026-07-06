# Developer Tools Collection

A comprehensive, blazingly fast suite of developer tools built to run entirely in your browser. Engineered with a modern web stack, this platform provides offline-ready, privacy-first utilities for encoding, formatting, generating, and visualizing code and text—all wrapped in a clean, minimalist, dark-mode-first UI.

## 🚀 Features

*   **100% Client-Side:** No server communication. Your data never leaves your browser, ensuring maximum privacy and instant feedback.
*   **Progressive Web App (PWA):** Installable on any device. Works offline seamlessly once cached.
*   **Modern Tech Stack:** Built with React 19, Vite, and Tailwind CSS v4.
*   **Glassmorphic & Brutalist UI:** Styled using `shadcn/ui` and custom glassmorphism effects for a premium aesthetic.

## 🧰 Available Tools

This collection is actively growing. Current built-in tools include:

*   **🎨 Whiteboard:** A native integration of Excalidraw for fast, hand-drawn-like diagramming and wireframing.
*   **📝 Markdown Viewer:** Real-time markdown rendering with GitHub Flavored Markdown (GFM) support and syntax highlighting.
*   **🔐 Base64 Encoder / Decoder:** Quickly convert strings to and from Base64 format.
*   **💾 SQL Formatter:** Beautify and format raw SQL queries instantly.
*   **🛡️ CVSS Calculator:** Calculate Common Vulnerability Scoring System metrics.
*   *And more being added constantly...*

## 🛠️ Development & Tech Stack

This project leverages modern frontend architecture:

*   [React 19](https://react.dev/) - Core framework
*   [Vite](https://vitejs.dev/) - Lightning-fast build tool and dev server
*   [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first styling
*   [shadcn/ui](https://ui.shadcn.com/) - Accessible, customizable UI components
*   [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
*   [Excalidraw](https://excalidraw.com/) - Virtual whiteboard engine

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tools.git
   cd tools
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you have an idea for a new developer tool, feel free to open a PR. Please adhere to the established architectural patterns (register tools in `src/config/tools.ts`).

## 📄 License

This project is open-source and available under standard open-source terms.
