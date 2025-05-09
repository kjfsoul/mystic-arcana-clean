# Mystic Arcana: Environment Variable Management Protocol

This document outlines the protocol for managing environment variables within the Mystic Arcana project. Consistent and secure management of these variables is crucial for application stability, security, and smooth development workflows across different environments (local, staging, production).

## I. Core Principles

1. **Security:** Sensitive information (API keys, database credentials) must never be hardcoded into the codebase or committed to version control.
2. **Consistency:** Use a standardized naming convention across all parts of the application.
3. **Clarity:** Variables should be clearly identifiable as frontend-specific or backend-specific.
4. **Environment-Specific:** Configuration should differ based on the environment (development, staging, production) without code changes.
5. **Accessibility:** Variables should be easily accessible by the relevant parts of the application (frontend JavaScript, backend Node.js/Netlify Functions).

## II. Naming Conventions

1. **Frontend Variables (Accessible in Browser Code via Vite):**
   * Must be prefixed with `VITE_`.
   * Example: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`.
   * Vite exposes these to `import.meta.env`.

2. **Backend Variables (Server-side, Netlify Functions, Scripts):**
   * No special prefix is strictly required, but use clear, uppercase, snake_case names.
   * Example: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`.
   * Accessible via `process.env` in Node.js environments (like Netlify Functions).

3. **General Format:** `SERVICE_CONFIG_KEY` (e.g., `SUPABASE_URL`, `STRIPE_SECRET_KEY`).

## III. Configuration by Environment

### A. Local Development

1. **File:** Create a `.env` file in the **root** of your project.
   * **This file MUST be added to `.gitignore`** to prevent committing secrets.
2. **Content Example (`.env`):**
   ```dotenv
   # Supabase Configuration (Backend & Frontend)
   SUPABASE_URL=https://fxigmwydtnvvrxaitiwu.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWdtd3lkdG52dnJ4YWl0aXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NjQyNzAsImV4cCI6MjA2MjM0MDI3MH0.zrX-ux1uA6Hf5e0jkwoKbCowvvbNfRA0FM4uLu4JaV4
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWdtd3lkdG52dnJ4YWl0aXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc2NDI3MCwiZXhwIjoyMDYyMzQwMjcwfQ.R3MWOlZyGethgfwLL-IvY6hQEYxBNOSVcvAm5FEY4K0

   # Vite requires frontend variables to be prefixed
   VITE_SUPABASE_URL=https://fxigmwydtnvvrxaitiwu.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aWdtd3lkdG52dnJ4YWl0aXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NjQyNzAsImV4cCI6MjA2MjM0MDI3MH0.zrX-ux1uA6Hf5e0jkwoKbCowvvbNfRA0FM4uLu4JaV4

   # OpenAI Configuration (Backend)
   OPENAI_API_KEY=sk-proj-ZQgkb1jZpgupc2nDWBIST3BlbkFJezxjF1oZLJG8GpUiMfYA

   # Stripe Configuration (Backend & Frontend)
   STRIPE_SECRET_KEY=your-stripe-test-secret-key
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-test-publishable-key

   # API Base URL for Frontend (if different from root)
   VITE_API_BASE_URL=/api 
   # For local Netlify Dev, this usually points to /.netlify/functions
   # VITE_API_BASE_URL=http://localhost:8888/.netlify/functions 
   ```
3. **Access:**
   * Frontend: `import.meta.env.VITE_VARIABLE_NAME`
   * Backend (Netlify Functions run via `netlify dev`): `process.env.VARIABLE_NAME`
   * Scripts: Use a library like `dotenv` (e.g., `require('dotenv').config()`) to load variables from `.env`.

### B. Netlify Deployment (Staging/Production)

1. **Method:** Configure environment variables directly in the Netlify dashboard.
2. **Location:**
   * Go to your Netlify Site Dashboard.
   * Navigate to **Site settings** (or "Build & deploy" > "Environment" in newer UI).
   * Under **Environment variables**, click "Add a variable" or "Edit variables".
3. **Variables to Add:**
   * All variables defined in your local `.env` file that are needed for the deployed application (both frontend-prefixed and backend). Netlify Build will make `VITE_` prefixed variables available to the frontend build process and non-prefixed variables available to Functions during runtime.
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   VITE_SUPABASE_URL 
   VITE_SUPABASE_ANON_KEY
   OPENAI_API_KEY
   STRIPE_SECRET_KEY
   VITE_STRIPE_PUBLISHABLE_KEY
   VITE_API_BASE_URL 
   ```
   *(Ensure `VITE_SUPABASE_URL` and `SUPABASE_URL` have the same value, same for `ANON_KEY`)*.
4. **Scopes:** Ensure variables are available to the correct scopes (Builds, Functions, Runtime). Netlify usually handles this well by default.
5. **Redeploy:** After adding/updating variables, you may need to trigger a new deploy for the changes to take effect in Functions. Build-time variables will be picked up on the next build.
6. **`netlify.toml` (Optional Fallbacks/Defaults):**
   While secrets should **not** be in `netlify.toml`, you can define non-sensitive, build-specific variables or default values if necessary:
   ```toml
   [build.environment]
     # Example: NODE_ENV = "production" (Netlify sets this automatically)
     # VITE_SOME_NON_SENSITIVE_CONFIG = "default_value"
   ```
   However, for consistency, using the Netlify UI for all variables is generally recommended.

## IV. Accessing Variables in Code

* **Frontend (React/Vite - `client` directory):**
  ```typescript
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  ```
* **Netlify Functions (`netlify/functions` directory):**
  ```javascript
  // Example in daily-tarot.js
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  ```
* **Scripts (`scripts` directory):**
  If a script needs environment variables (e.g., a seed script):
  ```javascript
  // At the top of your script
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); 
  // Adjust path to .env if script is not in root.

  const apiKey = process.env.OPENAI_API_KEY;
  ```

## V. Security Best Practices

1. **Never Commit `.env` Files:** Ensure `.env` is in your `.gitignore` file.
2. **Principle of Least Privilege:**
   * Use `SUPABASE_ANON_KEY` in the frontend.
   * Use `SUPABASE_SERVICE_ROLE_KEY` **only** in trusted backend environments (Netlify Functions) where it's absolutely necessary to bypass RLS.
3. **Review Access:** Regularly review who has access to your Netlify dashboard and repository settings.
4. **Variable Naming:** Avoid names that could be misinterpreted or reveal too much about the key's purpose if accidentally logged (though standard names like `API_KEY` are common).
5. **Frontend Exposure:** Remember that anything prefixed with `VITE_` will be bundled into your frontend JavaScript. While necessary for things like Supabase anon key or Stripe publishable key, do not put any secrets here.

## VI. Validation and Troubleshooting

* **Local:** Before running `npm run dev` or `netlify dev`, ensure your `.env` file is correctly populated.
* **Netlify Functions:** Use `console.log(process.env)` (temporarily, for debugging in Netlify Function logs) to check available variables if a function is misbehaving. **Remove these logs before committing/deploying fully to production to avoid leaking keys in logs.**
* **Netlify Build Logs:** Check build logs for any errors related to environment variables during the build process.
* **`check-supabase-url.html`:** This utility can be adapted to check if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly injected into the frontend.

By adhering to this protocol, Mystic Arcana can maintain a secure, organized, and efficient system for managing its critical configuration data.