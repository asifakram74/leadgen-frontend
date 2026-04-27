# LeadStation Pro - Premium Frontend (Dashboard)

LeadStation Pro Frontend is a state-of-the-art CRM interface built for high-performance lead visualization and management. It features a responsive, theme-aware design that scales from desktop to mobile effortlessly.

## 🎨 Technology Stack

*   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Components)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with [Redux Persist](https://github.com/rt2zz/redux-persist)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
*   **Icons**: [Lucide React](https://lucide.dev/) (Beautiful & consistent icons)
*   **API Client**: [Axios](https://axios-http.com/) (Promise-based HTTP client)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Static typing for robust code)

## ✨ Key Features

*   **Dynamic Dashboard**: Real-time visualization of scraped B2B leads.
*   **AI Build Interface**: Dedicated dashboard for triggering website analysis and automated landing page creation.
*   **Theme Engine**: Seamless high-contrast Light/Dark mode switching with persistent memory.
*   **Secure Auth UI**: Modern, centered authentication layouts (Login, Register, Forgot Password).
*   **Responsive Layout**: Mobile-first design with high-performance card views for managing leads on the go.
*   **Interactive Navigation**: Lucide-integrated menu with premium hover micro-animations.

## 📦 Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/leadstation-frontend.git
    cd leadstation-frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root and add:
    ```bash
    NEXT_PUBLIC_API_URL=https://leadgenbackend.onlinetoolpot.com
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🛠️ Build for Production

```bash
npm run build
npm run start
```
