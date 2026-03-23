"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { User } from "@/lib/types";
import PostCard from "@/components/PostCard";
import StoriesBar from "@/components/StoriesBar";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    // TODO: Change the URL below to your real backend endpoint.
    // Example: fetch("https://your-api.com/posts") d
    const fetchPosts = async () => {
      const responde = await fetch("/api/posts")
      const data = await responde.json();
      console.log(data); //verifica la respuesta en consola
      setPosts(data);
      setLoading(false);
    }

    const fetchSuggestions = async () => {
      const responde = await fetch("/api/suggestions")
      const data = await responde.json();
      console.log(data); //verifica la respuesta en consola
      setSuggestions(data);
      setLoading(false);
    }

    fetchPosts();
    fetchSuggestions();
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Loading feed…</div>;

  return (
    <div className="flex justify-center gap-8 px-4 py-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-6 w-full max-w-[468px]">
        <StoriesBar />
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <aside className="hidden xl:block w-72 flex-shrink-0 pt-4">
        <div className="sticky top-6">
          <div className="flex items-center gap-3 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/8.x/notionists/svg?seed=current"
              alt="Your avatar"
              className="w-11 h-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">yourhandle</p>
              <p className="text-xs text-gray-400">Your Name</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-400 mb-3">Suggested for you</p>
          {/* TODO: Fetch suggestions from your backend — fetch("/api/suggestions") */}
          {suggestions.map((user) => ( //mapeamos las sugerencias del backend, se ahce el recorrido de la key de cada usuario que es su id
            <div key={user.id} className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://api.dicebear.com/8.x/notionists/svg?seed=${user.avatar}`} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.username}</p>
                <p className="text-xs text-gray-400">{user.bio}</p>
              </div>
              <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">Follow</button>
            </div>
          ))}
          <p className="text-xs text-gray-300 mt-4">© 2025 Fakestagram · Teaching Project</p>
        </div>
      </aside>
    </div>
  );
}
