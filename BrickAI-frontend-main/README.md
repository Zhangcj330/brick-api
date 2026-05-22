
  # property Agent

  This is a code bundle for property Agent. The original project is available at https://www.figma.com/design/BbiWcxYABuTmHmbdihMG1Q/property-Agent.

  ## Running the code

  Run `npm i` to install the dependencies.

  Copy `.env.example` to `.env.local`.

  Required Supabase auth config:
  `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key`

  BrickAI agent API config:
  `NEXT_PUBLIC_BRICKAI_AGENT_API_BASE=http://localhost:8000/api/v1`

  The auth UI now uses Supabase email/password and Google OAuth. Make sure your Supabase project has those providers enabled and the local site URL added to the auth redirect allowlist.

  Run `npm run dev` to start the development server.
  
