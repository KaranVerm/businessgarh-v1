
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Channel = {
  id: string;
  name: string;
  description: string | null;
};

type ChatMessage = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function CommunityChat() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // LOAD USER AND CHANNELS
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadChat() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        window.location.href = "/auth/login";
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("channels")
        .select("id, name, description")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
      } else {
        setChannels(data || []);

        if (data && data.length > 0) {
          setActiveChannelId(data[0].id);
        }
      }

      setLoading(false);
    }

    loadChat();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD MESSAGES
  useEffect(() => {
    if (!activeChannelId) return;

    const supabase = createClient();
    let cancelled = false;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          channel_id,
          user_id,
          content,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("channel_id", activeChannelId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const orderedMessages = (
        (data || []) as unknown as ChatMessage[]
      ).reverse();

      setMessages(orderedMessages);
    }

    setMessages([]);
    setErrorMessage("");

    void loadMessages();

    // REALTIME SUBSCRIPTION
    const subscription = supabase
      .channel(`messages-${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
        () => {
          void loadMessages();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(subscription);
    };
  }, [activeChannelId]);

  // SEND MESSAGE
  async function handleSendMessage(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const content = messageText.trim();

    if (!content || !activeChannelId || !currentUserId) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("messages")
      .insert({
        channel_id: activeChannelId,
        user_id: currentUserId,
        content,
      });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setMessageText("");
    }

    setSending(false);
  }

  const activeChannel = channels.find(
    (channel) => channel.id === activeChannelId
  );

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-300">
          Loading Businessgarh Community Chat...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            BUSINESSGARH
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Community Chat
          </h1>

          <p className="mt-2 text-slate-400">
            Connect, communicate and share ideas with other members.
          </p>
        </div>

        <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 md:grid-cols-[260px_1fr]">

          {/* CHANNEL SIDEBAR */}
          <aside className="border-b border-slate-700 bg-slate-900 p-4 md:border-b-0 md:border-r">

            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
              Community Channels
            </h2>

            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                    activeChannelId === channel.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="block font-semibold">
                    # {channel.name}
                  </span>

                  <span className="mt-1 block text-xs opacity-70">
                    {channel.description}
                  </span>
                </button>
              ))}
            </div>

            <a
              href="/protected"
              className="mt-8 block rounded-lg px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              ← Back to Dashboard
            </a>
          </aside>

          {/* CHAT AREA */}
          <section className="flex min-w-0 flex-col">

            <div className="border-b border-slate-700 px-5 py-4">
              <h2 className="text-lg font-bold text-white">
                # {activeChannel?.name || "Select a channel"}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {activeChannel?.description}
              </p>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">

              {messages.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-lg font-semibold text-slate-300">
                    No messages yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage =
                    message.user_id === currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        isOwnMessage ? "flex-row-reverse" : ""
                      }`}
                    >
                      {message.profiles?.avatar_url ? (
                        <img
                          src={message.profiles.avatar_url}
                          alt="Member"
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700">
                          👤
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] ${
                          isOwnMessage ? "text-right" : ""
                        }`}
                      >
                        <p className="mb-1 text-xs text-slate-400">
                          {isOwnMessage
                            ? "You"
                            : message.profiles?.full_name ||
                              "Community Member"}
                          {" · "}
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <div
                          className={`inline-block rounded-2xl px-4 py-3 text-left text-sm leading-6 ${
                            isOwnMessage
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-slate-200"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

            </div>

            {/* MESSAGE INPUT */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-700 p-4"
            >
              {errorMessage && (
                <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a message..."
                  maxLength={2000}
                  disabled={!activeChannelId || sending}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !messageText.trim() ||
                    !activeChannelId
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Maximum 2,000 characters per message.
              </p>
            </form>

          </section>
        </div>
      </div>
    </main>
  );
}
