import React from "react";

// Helper to format time ago
function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostsFeed({ posts }) {
  return (
    <div className="max-w-3xl mx-auto px-2 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map(post => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-lg p-4 mb-6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center mb-4">
              <img
                src={post.userProfilePic}
                alt={post.userName}
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{post.userName}</div>
                <div className="text-sm text-gray-500">{post.userLocation}</div>
              </div>
              <div className="text-xs text-gray-400">{timeAgo(new Date(post.createdAt))}</div>
            </div>
            {/* Media */}
            <div className="w-full mb-4">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-64 object-cover rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                />
              )}
              {/* If you want to support video, add a check for post.videoUrl */}
            </div>
            {/* Caption */}
            {post.caption && (
              <div className="text-gray-700 mb-4">{post.caption}</div>
            )}
            {/* Interaction Buttons */}
            <div className="flex justify-around border-t pt-2 mt-auto">
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition">
                <svg width="20" height="20" fill="currentColor" className="mr-1"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-2 0zm1 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>
                Like
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition">
                <svg width="20" height="20" fill="currentColor" className="mr-1"><path d="M2 17.5V6a2 2 0 012-2h12a2 2 0 012 2v11.5a.5.5 0 01-.8.4L10 14.1l-7.2 3.8a.5.5 0 01-.8-.4z"/></svg>
                Comment
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition">
                <svg width="20" height="20" fill="currentColor" className="mr-1"><path d="M15 8V6a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h6a3 3 0 003-3v-2l4 4V4l-4 4z"/></svg>
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
