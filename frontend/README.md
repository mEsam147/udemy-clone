# Mini Udemy - Premium Online Learning Platform

A modern, premium online learning platform built with Next.js 13, TypeScript, and Tailwind CSS. Features full internationalization (English/Arabic) with RTL support, premium animations, and integration-ready architecture for Supabase and Stripe.

## 🚀 Features

- **Modern Tech Stack**: Next.js 13 App Router, TypeScript, Tailwind CSS
- **Internationalization**: Full i18n support with English and Arabic (RTL)
- **Premium UI/UX**: Framer Motion animations, dark/light themes, responsive design
- **Course Management**: Complete course creation, management, and enrollment system
- **User Roles**: Student and instructor dashboards with role-based features
- **Payment Ready**: Stripe integration placeholders for course purchases
- **Video Learning**: Video player with progress tracking and signed URL support
- **Authentication**: Supabase auth integration placeholders

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Internationalization**: next-intl
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

## 📦 Installation

1. **Clone and install dependencies**:
   \`\`\`bash
   git clone <repository-url>
   cd mini-udemy-frontend
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   \`\`\`

3. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Internationalization

The app supports English and Arabic with full RTL layout support:

- **English**: `/en/...` (default)
- **Arabic**: `/ar/...` (RTL layout)

Language switching is available in the navbar and automatically adjusts:
- Text direction (LTR/RTL)
- Font family (Inter for English, Cairo for Arabic)
- Layout spacing and alignment

## 🔧 Backend Integration Points

This is a **frontend-only** implementation with clear integration hooks for backend services:

### Supabase Integration
- **Authentication**: `lib/auth.ts` (placeholder)
- **Database**: `lib/supabase.ts` (placeholder)
- **File Storage**: Video and image upload endpoints
- **Row Level Security**: Database schema with RLS policies needed

### Stripe Integration
- **Payments**: `/api/stripe/create-checkout-session`
- **Webhooks**: `/api/stripe/webhook` for payment confirmations
- **Customer Portal**: Account settings billing section

### Required API Endpoints

The frontend expects these API routes to be implemented:

\`\`\`
/api/courses              # GET, POST - Course CRUD
/api/courses/[slug]       # GET, PUT, DELETE - Individual course
/api/auth/me             # GET - Current user profile
/api/auth/profile        # PUT - Update user profile
/api/purchases           # GET - User's purchased courses
/api/progress/[lessonId] # PUT - Update lesson progress
/api/video-url           # POST - Get signed video URLs
/api/upload              # POST - File upload (thumbnails, videos)
/api/stripe/*            # Stripe payment endpoints
\`\`\`

### Database Schema

Required tables (implement with Supabase):
- `users` - User profiles and roles
- `courses` - Course information
- `course_sections` - Course sections/modules
- `lessons` - Individual lessons
- `purchases` - Course purchases
- `progress` - User learning progress
- `reviews` - Course reviews

## 📱 Pages & Routes

- **`/`** - Landing page with hero, features, pricing
- **`/courses`** - Course catalog with search/filter
- **`/courses/[slug]`** - Individual course details
- **`/auth/signin`** - Sign in form
- **`/auth/signup`** - Sign up form
- **`/dashboard/student`** - Student dashboard
- **`/dashboard/instructor`** - Instructor dashboard
- **`/account/settings`** - Account settings

## 🎨 Design System

### Colors
- **Primary**: Blue-based brand colors
- **Secondary**: Purple accent colors
- **Neutrals**: Grays and whites
- **Dark Mode**: Full dark theme support

### Typography
- **English**: Inter font family
- **Arabic**: Cairo font family
- **Responsive**: Fluid typography scales

### Animations
- **Scroll Reveals**: Framer Motion `whileInView`
- **Micro-interactions**: Hover effects, button animations
- **Page Transitions**: Smooth navigation
- **Loading States**: Skeleton loaders

## 🔒 Security Considerations

When implementing the backend:

1. **Authentication**: Implement proper JWT validation
2. **Authorization**: Role-based access control (RBAC)
3. **Data Validation**: Server-side input validation
4. **File Uploads**: Secure file handling and virus scanning
5. **Rate Limiting**: API rate limiting and abuse prevention
6. **CORS**: Proper CORS configuration
7. **Environment Variables**: Secure secret management

## 📊 Mock Data

Development uses mock data from `lib/mock-data.ts`:
- Sample courses and instructors
- User profiles and reviews
- Categories and testimonials

Replace with real API calls when backend is ready.

## 🚀 Deployment

1. **Build the application**:
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel** (recommended):
   \`\`\`bash
   vercel deploy
   \`\`\`

3. **Set environment variables** in your deployment platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a frontend-only implementation. Backend integration with Supabase and Stripe is required for full functionality. All API calls are currently mocked and need to be replaced with actual implementations.
