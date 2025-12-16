import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { sanitizeHTML } from "@/lib/sanitize"

async function getArticle(slug: string) {
  try {
    return await prisma.news.findUnique({
      where: { slug, isPublished: true },
    })
  } catch {
    return null
  }
}

async function getRelatedNews(currentSlug: string) {
  try {
    return await prisma.news.findMany({
      where: {
        isPublished: true,
        slug: { not: currentSlug },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    })
  } catch {
    return []
  }
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const relatedNews = await getRelatedNews(slug)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {article.image && (
        <div className="relative h-[300px] md:h-[400px] bg-gray-900">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/news" className="hover:text-blue-600">News</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate">{article.title}</span>
        </nav>

        {/* Back Button */}
        <Link href="/news">
          <Button variant="outline" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Button>
        </Link>

        {/* Article */}
        <article className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-gray-600 mt-4">{article.excerpt}</p>
            )}
          </header>

          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.content) }}
          />
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32">
                    <Image
                      src={news.image || "/placeholder-news.jpg"}
                      alt={news.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{news.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {news.publishedAt
                        ? new Date(news.publishedAt).toLocaleDateString()
                        : new Date(news.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
