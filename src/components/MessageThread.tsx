"use client";

import { useState, useRef, useEffect } from "react";
import { Conversation, DirectMessage } from "@/lib/types";
import { CURRENT_USER } from "@/lib/mock-data";
import { formatDistanceToNow } from "@/lib/utils";

interface Props {
  initialConversation: Conversation;
}

export default function MessageThread({ initialConversation }: Props) {
  const [messages, setMessages] = useState(initialConversation.messages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null); //referencia al input de archivo, igual que en edit profile

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    // Optimistic update — add message locally right away
    const optimistic: DirectMessage = {
      id: `msg_optimistic_${Date.now()}`,
      senderId: CURRENT_USER.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);

    // TODO: Change the URL below to your real backend endpoint.
    // Example: fetch("https://your-api.com/messages", { method: "POST", ... })
    
    // Si el usuario seleccionó un archivo, lo subimos primero y guardamos la URL
    let mediaUrl = null;
    const file = fileRef.current?.files?.[0];
 
    if (file) {
      const formData = new FormData(); //los archivos se mandan como multipart/form-data
      formData.append("file", file);
 
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
 
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        mediaUrl = uploadData.url; //se guarda la URL de la imagen subida para mandarla junto al mensaje
      }
 
      if (fileRef.current) fileRef.current.value = ""; //se limpia el input de archivo después de subir
    }
 
    // se envia el mensaje al backend con el texto y la URL del archivo solo si hay
    const response = await fetch(`/api/messages/${initialConversation.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: optimistic.text,
        mediaUrl, //si no hay archivo, mediaUrl es null y el backend lo ignora
      }),
    });
 
    const data = await response.json();
 
    if (data.message) {
      // Reemplazamos el mensaje optimista por el real que devuelve el servidor
      // el servidor le asigna un id real en lugar del id temporal que pusimos
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimistic.id ? data.message : msg))
      );
    }
 
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={initialConversation.participant.avatar}
          alt={initialConversation.participant.username}
          className="w-9 h-9 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{initialConversation.participant.username}</p>
          <p className="text-xs text-gray-400">{initialConversation.participant.name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {messages.map((msg) => {
          const isMe = msg.senderId === CURRENT_USER.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                  {formatDistanceToNow(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-4 py-3 border-t border-gray-200">
        {/* TODO: Add a file picker here for media messages.
            After picking a file, upload it with UploadThing and pass the returned URL
            as `mediaUrl` in the fetch body above. 
            Se implementó como en edit page, que es con el api upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-gray-400 hover:text-gray-600"
        >
          {/* Ícono de imagen */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zM16.5 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
        {/* Input de archivo oculto*/}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" />
 
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="text-sm font-semibold text-blue-500 disabled:opacity-40"
        >
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
