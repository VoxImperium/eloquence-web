# SETUP.md

## Environment Configuration
1. Clone the repository
   ```bash
   git clone https://github.com/VoxImperium/eloquence-web.git
   ```
2. Navigate to the project directory
   ```bash
   cd eloquence-web
   ```

3. Install dependencies
   ```bash
   npm install
   ```

## Service Setup Instructions

### Brevo
1. Sign up at [Brevo](https://www.brevo.com)
2. Generate API keys
3. Configure in your `.env` file:
   ```
   BREV0_API_KEY=your_brevo_api_key
   ```

### Stripe
1. Create an account at [Stripe](https://stripe.com)
2. Obtain your API keys from the dashboard
3. Configure in your `.env` file:
   ```
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

### Supabase
1. Set up a project at [Supabase](https://supabase.com)
2. Retrieve your project URL and API keys
3. Configure in your `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Railway
1. Create a project on [Railway](https://railway.app)
2. Deploy your application
3. Configure your Railway environment variables accordingly

## Deployment Steps
1. Build the project
   ```bash
   npm run build
   ```
2. Deploy to your preferred hosting platform