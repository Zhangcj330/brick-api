"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useLandingTheme } from "@/src/components/landing-theme";

const logoImage = "/brickAI_logo_transparent.png";

export default function App() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const { activeVariant } = useLandingTheme();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    router.push(`/chat?message=${encodeURIComponent(message.trim())}`);
  };

  const navigateToChat = () => {
    router.push("/chat");
  };

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  const navigateToAuth = () => {
    router.push("/auth");
  };

  const navigateHome = () => {
    router.push("/");
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  const navigateToSwipe = () => {
    router.push("/swipe");
  };

  return (
    <>
      <header className="relative z-10 border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            onClick={navigateHome}
            className="flex items-center gap-2 text-sm tracking-wide text-gray-700 transition hover:text-gray-900"
          >
            <img
              src={logoImage}
              alt="Brick AI logo"
              className="h-28 w-auto"
            />
          </button>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={navigateToAuth}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Sign in
            </button>
            <button
              onClick={navigateToDashboard}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={navigateToSwipe}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Swipe Mode
            </button>
            <button
              onClick={navigateToProfile}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              Profile
            </button>
            <button
              onClick={navigateToChat}
              className="rounded-full bg-gray-900 px-4 py-1.5 font-medium text-white transition hover:bg-gray-800"
            >
              Try the chat
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center">
        <div className="mx-auto max-w-3xl px-6 pt-24 text-center sm:pt-28">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.3em] text-gray-600 backdrop-blur-sm">
            {activeVariant.label}
          </div>
          <h1 className="mt-6 tracking-tight text-gray-900 sm:text-5xl">
            {activeVariant.heading}
          </h1>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">
            {activeVariant.subheading}
          </p>
        </div>

        <section className="mx-auto mt-16 w-full max-w-3xl px-4">
          <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-6">
              {activeVariant.conversation.map((messageItem, index) => (
                <div
                  key={index}
                  className={`flex ${messageItem.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-6 sm:text-base ${
                      messageItem.role === "user"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    }`}
                  >
                    {messageItem.content}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-12 space-y-3"
            >
              <label
                htmlFor="landing-chat-input"
                className="text-[10px] uppercase tracking-[0.35em] text-gray-500"
              >
                Start chatting now
              </label>
              <div className="relative flex items-center rounded-2xl border border-gray-300 bg-white px-4 py-1.5">
                <input
                  id="landing-chat-input"
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={activeVariant.placeholder}
                  className="h-14 w-full bg-transparent pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base"
                  aria-label="Start your intelligent property conversation"
                />
                <button
                  type="submit"
                  className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500"
                  disabled={!message.trim()}
                  aria-label="Send first message"
                >
                  <Send className="h-4 w-4 -translate-x-px" />
                </button>
              </div>
            </form>
          </div>

          <p className="mt-10 text-center text-xs text-gray-500">
            {activeVariant.summary}
          </p>
        </section>
      </main>

      <footer className="relative z-10 mt-24 border-t border-gray-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 text-xs text-gray-500">
          <span>
            © {new Date().getFullYear()} Brick AI Labs
          </span>
          <div className="flex items-center gap-6">
            <button
              onClick={navigateToAuth}
              className="hover:text-gray-700 transition"
            >
              Sign in
            </button>
            <button
              onClick={navigateToSwipe}
              className="hover:text-gray-700 transition"
            >
              Swipe Mode
            </button>
            <button
              onClick={navigateToChat}
              className="hover:text-gray-700 transition"
            >
              Product demo
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
