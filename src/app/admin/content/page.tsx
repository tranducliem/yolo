/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminPost {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string;
  tags: string[];
  visibility: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  users: { display_name: string; email: string };
}

export default function ContentAdminPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "reports" | "hidden">("posts");

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-6 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-28 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0D1B2A]">Content Management</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            ["posts", "Posts"],
            ["reports", "Reports"],
            ["hidden", "Hidden"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Posts Tab */}
        {tab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Total: {posts.length} posts</p>
              </div>
              {posts.length === 0 ? (
                <div className="py-16 text-center text-gray-400">No posts found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0D1B2A] text-white">
                        <th className="rounded-tl-lg px-2 py-3 text-left font-medium">Thumbnail</th>
                        <th className="px-2 py-3 text-left font-medium">User</th>
                        <th className="px-2 py-3 text-left font-medium">Caption</th>
                        <th className="px-2 py-3 text-left font-medium">Date</th>
                        <th className="px-2 py-3 text-right font-medium">Likes</th>
                        <th className="px-2 py-3 text-right font-medium">Comments</th>
                        <th className="rounded-tr-lg px-2 py-3 text-center font-medium">
                          Visibility
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post, postIdx) => (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-gray-50 transition-all duration-200 hover:bg-gray-100 ${postIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                        >
                          <td className="px-2 py-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-200">
                              {post.photo_url && (
                                <img
                                  src={post.photo_url}
                                  alt="post"
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-3 font-medium text-gray-900">
                            {post.users?.display_name || "Unknown"}
                          </td>
                          <td className="max-w-[200px] truncate px-2 py-3 text-xs text-gray-600">
                            {post.caption || "-"}
                          </td>
                          <td className="px-2 py-3 text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-3 text-right text-gray-700">
                            {post.likes_count || 0}
                          </td>
                          <td className="px-2 py-3 text-right text-gray-700">
                            {post.comments_count || 0}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                post.visibility === "public"
                                  ? "bg-green-50 text-green-600"
                                  : post.visibility === "followers"
                                    ? "bg-blue-50 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {post.visibility}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="py-16 text-center text-gray-400">
                No reports found. Reports will appear when users submit them.
              </div>
            </div>
          </motion.div>
        )}

        {/* Hidden Tab */}
        {tab === "hidden" && (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="py-16 text-center text-gray-400">No hidden posts</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
