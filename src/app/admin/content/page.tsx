"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockPosts, mockReports } from "@/lib/mockData";

const reportStatusColor: Record<string, string> = {
  pending: "bg-red-50 text-red-600",
  resolved: "bg-green-50 text-green-600",
  dismissed: "bg-gray-100 text-gray-500",
};

const reportStatusLabel: Record<string, string> = {
  pending: "対応待ち",
  resolved: "対応済み",
  dismissed: "問題なし",
};

export default function ContentAdminPage() {
  const [tab, setTab] = useState<"posts" | "reports" | "hidden">("posts");
  const [donationOnly, setDonationOnly] = useState(false);

  // Report counts for posts
  const reportCountMap: Record<string, number> = {};
  mockReports.forEach((r) => {
    reportCountMap[r.postId] = (reportCountMap[r.postId] || 0) + 1;
  });

  // Filter posts
  const visiblePosts = mockPosts.slice(0, 20).filter((p) => {
    if (donationOnly && !p.isDonationTag) return false;
    return true;
  });

  // Mock hidden posts
  const hiddenPosts = mockPosts.slice(25, 28);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-[#0D1B2A] mb-6">
        📝 コンテンツ管理
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            ["posts", "投稿一覧"],
            ["reports", "通報一覧"],
            ["hidden", "非表示一覧"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-[#2A9D8F] text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {label}
            {key === "reports" && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {mockReports.filter((r) => r.status === "pending").length}
              </span>
            )}
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
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Donation tag filter toggle */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  全{visiblePosts.length}件
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500">
                    🌟 寄付タグ投稿のみ
                  </span>
                  <button
                    onClick={() => setDonationOnly(!donationOnly)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      donationOnly ? "bg-[#2A9D8F]" : "bg-gray-300"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ x: donationOnly ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0D1B2A] text-white">
                      <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                        サムネイル
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        ペット
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        投稿者
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        投稿日
                      </th>
                      <th className="text-right py-3 px-2 font-medium">
                        いいね
                      </th>
                      <th className="text-center py-3 px-2 font-medium">
                        通報
                      </th>
                      <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                        寄付
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePosts.map((post, postIdx) => {
                      const rc = reportCountMap[post.id] || 0;
                      return (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${postIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                        >
                          <td className="py-3 px-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.imageUrl}
                                alt={post.petName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium text-gray-900">
                            {post.petName}
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {post.ownerName}
                          </td>
                          <td className="py-3 px-2 text-gray-500 text-xs">
                            {post.createdAt}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-700">
                            {post.likes}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {rc > 0 ? (
                              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {rc}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {post.isDonationTag ? (
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                🌟 ¥{post.donationAmount}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0D1B2A] text-white">
                      <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                        日付
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        投稿
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        対象ユーザー
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        理由
                      </th>
                      <th className="text-left py-3 px-2 font-medium">
                        通報者
                      </th>
                      <th className="text-center py-3 px-2 font-medium">
                        ステータス
                      </th>
                      <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReports.map((report, reportIdx) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${reportIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="py-3 px-2 text-gray-600 text-xs">
                          {report.date}
                        </td>
                        <td className="py-3 px-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={report.postImage}
                              alt="post"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-700">
                          {report.targetUser}
                        </td>
                        <td className="py-3 px-2 text-gray-700">
                          {report.reason}
                        </td>
                        <td className="py-3 px-2 text-gray-500">
                          {report.reporterName}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${reportStatusColor[report.status]}`}
                          >
                            {reportStatusLabel[report.status]}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {report.status === "pending" && (
                            <div className="flex gap-1 justify-center">
                              <button className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-lg hover:bg-red-100 transition-all duration-200">
                                非表示にする
                              </button>
                              <button className="bg-yellow-50 text-yellow-600 text-[10px] px-2 py-1 rounded-lg hover:bg-yellow-100 transition-all duration-200">
                                警告を送る
                              </button>
                              <button className="bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-lg hover:bg-gray-200 transition-all duration-200">
                                問題なし
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {hiddenPosts.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  非表示の投稿はありません
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#0D1B2A] text-white">
                        <th className="text-left py-3 px-2 font-medium rounded-tl-lg">
                          サムネイル
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          ペット
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          投稿者
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          非表示理由
                        </th>
                        <th className="text-center py-3 px-2 font-medium rounded-tr-lg">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {hiddenPosts.map((post, hiddenIdx) => (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-gray-50 hover:bg-gray-100 transition-all duration-200 ${hiddenIdx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                        >
                          <td className="py-3 px-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden opacity-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.imageUrl}
                                alt={post.petName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-2 font-medium text-gray-900">
                            {post.petName}
                          </td>
                          <td className="py-3 px-2 text-gray-600">
                            {post.ownerName}
                          </td>
                          <td className="py-3 px-2 text-gray-500 text-xs">
                            通報による非表示
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-lg hover:bg-emerald-100 transition-all duration-200">
                              復元する
                            </button>
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
      </AnimatePresence>
    </div>
  );
}
