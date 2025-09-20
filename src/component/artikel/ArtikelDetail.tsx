"use client";
import { useEffect, useState } from "react";

interface Article {
  id: number;
  gambar: string;
  gambar_url?: string;
  judul_halaman: string;
  category: string;
  created_at: string;
  author: string;
  deskripsi: string;
}

const ArtikelDetail = ({ articleId }: { articleId: string | null }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<any>(null);

  // Helper function to get correct image URL
  const getImageUrl = (article: Article | null) => {
    const baseUrl = import.meta.env.PROD 
      ? 'https://api.bersekolah.com'
      : (import.meta.env.PUBLIC_API_BASE_URL?.replace('/api', '') || 'https://api.bersekolah.com');
    
    if (!article) return `${baseUrl}/storage/defaults/artikel-default.jpg`;

    // Check for gambar_url first (if API provides full URL)
    if (article.gambar_url) {
      return article.gambar_url;
    }

    // Check for gambar and handle all cases
    if (article.gambar) {
      // If it's a full URL already, return it
      if (article.gambar.startsWith("http")) {
        return article.gambar;
      }

      // Check if it already has /storage/ prefix from API response
      if (article.gambar.startsWith("/storage/")) {
        return `${baseUrl}${article.gambar}`;
      }

      // Otherwise, construct Laravel storage path for admin/artikel folder
      return `${baseUrl}/storage/admin/artikel/${article.gambar}`;
    }

    // Default fallback to Laravel storage defaults
    return `${baseUrl}/storage/defaults/artikel-default.jpg`;
  };

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.PUBLIC_API_BASE_URL || 'https://api.bersekolah.com/api'}/konten/${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        setDebug(data);

        if (data.data) {
          setArticle(data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching article:", error);
        setLoading(false);
      });
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-t-2 border-b-2 border-[#406386] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-xl text-gray-600">Artikel tidak ditemukan</p>
        <a
          href="/company-profile/artikel"
          className="text-[#406386] hover:underline"
        >
          Kembali ke Daftar Artikel
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Gambar Utama */}
      <section className="relative w-full min-h-[320px] md:min-h-[420px] flex items-end justify-center overflow-hidden">
        <img
          src={getImageUrl(article)}
          alt={article.judul_halaman}
          className="object-cover object-center absolute inset-0 z-0 w-full h-full opacity-90"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/storage/artikel/default.jpg";
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t to-transparent from-black/80 via-black/40" />
        <div className="relative z-20 px-4 pb-10 mx-auto w-full max-w-4xl text-white">
          <span className="inline-block px-4 py-2 mb-4 text-xs font-semibold bg-[#406386]/90 rounded-full shadow-lg">
            {article.category}
          </span>
          <h1 className="mb-2 text-3xl font-bold leading-tight drop-shadow-lg md:text-5xl">
            {article.judul_halaman}
          </h1>
          <div className="flex flex-wrap gap-3 items-center text-sm md:text-base text-gray-200/90">
            <span className="font-medium">{article.author}</span>
            <span>•</span>
            <time>
              {new Date(article.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
        </div>
      </section>

      {/* Isi Artikel */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50 min-h-[300px]">
        <div className="container px-4 mx-auto">
          <div className="relative z-20 p-8 mx-auto -mt-32 max-w-3xl bg-white rounded-xl shadow-lg md:p-12">
            <div className="max-w-none text-gray-800 prose prose-lg">
              <p className="mb-6 text-lg leading-relaxed whitespace-pre-line">
                {article.deskripsi}
              </p>
            </div>
            <div className="flex justify-end mt-8">
              <a
                href="/company-profile/artikel"
                className="inline-block px-6 py-2 rounded-lg bg-[#406386] text-white font-semibold hover:bg-[#2d4663] transition-all duration-200 shadow"
              >
                ← Kembali ke Daftar Artikel
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArtikelDetail;