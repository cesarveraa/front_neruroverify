# PromoBuilder - React SPA with Authentication

A modern, scalable React Single Page Application built with Vite, TypeScript, and Tailwind CSS. Features comprehensive authentication, multi-language support, dark/light themes, and a modular business verticals system.

## 🚀 Features

- **Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS
- **Authentication**: Email/password + Google Sign-In via Firebase
- **Multi-language**: English and Spanish support with react-i18next
- **Theme Support**: Light, dark, and system theme modes
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Feature-Sliced Architecture**: Scalable and maintainable code organization
- **Business Verticals**: Marketing, Legal, Restaurant, and more
- **State Management**: Zustand for lightweight state management
- **Form Handling**: react-hook-form with Zod validation
- **UI Components**: shadcn/ui component library
- **Accessibility**: WCAG compliant with proper ARIA attributes

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Authentication & Backend
- **Firebase** - Google authentication
- **Axios** - HTTP client with credentials support
- **Backend API**: `https://auth-google-c.vercel.app`

### State & Forms
- **Zustand** - State management
- **react-hook-form** - Form handling
- **Zod** - Schema validation

### UI & UX
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives
- **react-i18next** - Internationalization

### Routing
- **React Router DOM** - Client-side routing with guards

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd react-spa-auth
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   \`\`\`env
   VITE_API_URL=https://auth-google-c.vercel.app
   
   VITE_FIREBASE_API_KEY=AIzaSyAxug6QhAwmn5hjnMYyZ3sE2s0RgeSEuK4
   VITE_FIREBASE_AUTH_DOMAIN=auth--crea.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=auth--crea
   VITE_FIREBASE_STORAGE_BUCKET=auth--crea.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=948059835642
   VITE_FIREBASE_APP_ID=1:948059835642:web:22c50452a476fcea3acd43
   VITE_FIREBASE_MEASUREMENT_ID=G-G03D4T72SP
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

\`\`\`
src/
├── app/                    # Application bootstrap
│   ├── providers/          # Context providers (theme, etc.)
│   ├── router.tsx          # Route configuration
│   └── app.tsx            # Main app component
├── shared/                 # Shared utilities and components
│   ├── lib/               # API client, Firebase config
│   ├── ui/                # Reusable UI components
│   └── hooks/             # Custom hooks
├── entities/              # Domain entities
│   └── user/              # User entity and types
├── features/              # Feature-specific code
│   ├── auth/              # Authentication feature
│   └── profile/           # Profile management
├── pages/                 # Page components
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard page
│   ├── profile/           # Profile page
│   └── verticals/         # Business verticals pages
├── widgets/               # Composite UI components
│   └── layout/            # Layout components (navbar, etc.)
├── processes/             # Cross-feature processes
│   └── auth-gate/         # Authentication guards
└── i18n/                  # Internationalization
    └── locales/           # Translation files
\`\`\`

## 🔐 Authentication Flow

### Email/Password Authentication
1. **Registration**: `POST /auth/email/register`
2. **Login**: `POST /auth/email/login`
3. **Session**: Backend sets `__session` httpOnly cookie
4. **User Data**: `GET /users/me` to populate user state

### Google Authentication
1. **Firebase Sign-In**: `signInWithPopup(GoogleAuthProvider)`
2. **Get ID Token**: `user.getIdToken()`
3. **Backend Session**: `POST /auth/session/login` with `id_token`
4. **User Data**: `GET /users/me` to populate user state

### Logout
- **Backend**: `POST /auth/session/logout`
- **Frontend**: Clear user state and redirect

## 🌍 Internationalization

The app supports English and Spanish with lazy-loaded namespaces:

- `common` - Navigation, buttons, general UI
- `auth` - Authentication forms and messages
- `dashboard` - Dashboard content
- `profile` - Profile management
- `verticals` - Business verticals content

### Adding New Languages

1. Create new locale files in `src/i18n/locales/[lang]/`
2. Add language to `resources` object in `src/i18n/index.ts`
3. Update language switcher in `src/shared/ui/language-switcher.tsx`

## 🎨 Theming

The app supports three theme modes:
- **Light** - Default light theme
- **Dark** - Dark theme with proper contrast
- **System** - Follows system preference

Theme preference is persisted in localStorage and applied via CSS classes.

## 📱 Business Verticals

The app includes several business verticals:

- **Marketing** - Campaign templates, analytics, A/B testing
- **Legal Services** - Professional templates, document management
- **Restaurants** - Menu builders, online ordering, reservations
- **Healthcare** - Patient portals, appointment booking
- **Education** - Course catalogs, student portals
- **Real Estate** - Property listings, virtual tours

### Adding New Verticals

1. Create new page component in `src/pages/verticals/`
2. Add route to `src/app/router.tsx`
3. Update verticals list in `src/pages/verticals/verticals.tsx`
4. Add translations to `src/i18n/locales/*/verticals.json`

## 🚀 Deployment

### Build for Production
\`\`\`bash
pnpm build
# or
npm run build
# or
yarn build
\`\`\`

### Preview Production Build
\`\`\`bash
pnpm preview
# or
npm run preview
# or
yarn preview
\`\`\`

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🧪 Development

### Code Quality
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Best Practices
- Feature-Sliced Design architecture
- Semantic HTML and ARIA attributes
- Mobile-first responsive design
- Error boundaries for error handling
- Loading states and skeleton screens
- Toast notifications for user feedback

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue in the repository or contact the development team.
# front_neruroverify
