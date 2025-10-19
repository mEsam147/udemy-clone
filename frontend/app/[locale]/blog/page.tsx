// app/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  ArrowRight, 
  BookOpen,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Filter,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  image: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14: A Comprehensive Guide",
    excerpt: "Learn how to build modern web applications with Next.js 14, featuring the new App Router, Server Components, and enhanced performance optimizations.",
    content: "Full content here...",
    author: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      bio: "Senior Frontend Developer"
    },
    publishedAt: "2024-01-15",
    readTime: 8,
    category: "Web Development",
    tags: ["Next.js", "React", "TypeScript", "Tutorial"],
    image: "/blog/nextjs-guide.jpg",
    slug: "getting-started-nextjs-14",
    views: 1247,
    likes: 89,
    comments: 23,
    featured: true
  },
  {
    id: "2",
    title: "Mastering TypeScript: Advanced Patterns and Best Practices",
    excerpt: "Discover advanced TypeScript patterns that will make your code more robust, maintainable, and type-safe.",
    content: "Full content here...",
    author: {
      name: "Mike Chen",
      avatar: "/avatars/mike.jpg",
      bio: "TypeScript Expert"
    },
    publishedAt: "2024-01-12",
    readTime: 12,
    category: "Programming",
    tags: ["TypeScript", "JavaScript", "Best Practices"],
    image: "/blog/typescript-patterns.jpg",
    slug: "mastering-typescript-patterns",
    views: 892,
    likes: 67,
    comments: 18,
    featured: true
  },
  {
    id: "3",
    title: "The Future of AI in Web Development",
    excerpt: "Exploring how artificial intelligence is revolutionizing the way we build and interact with web applications.",
    content: "Full content here...",
    author: {
      name: "Dr. Emily Watson",
      avatar: "/avatars/emily.jpg",
      bio: "AI Researcher"
    },
    publishedAt: "2024-01-10",
    readTime: 6,
    category: "Artificial Intelligence",
    tags: ["AI", "Machine Learning", "Web Development", "Innovation"],
    image: "/blog/ai-future.jpg",
    slug: "future-ai-web-development",
    views: 1563,
    likes: 124,
    comments: 42,
    featured: false
  },
  {
    id: "4",
    title: "Building Scalable React Applications",
    excerpt: "Architectural patterns and strategies for building React applications that scale with your user base.",
    content: "Full content here...",
    author: {
      name: "Alex Rodriguez",
      avatar: "/avatars/alex.jpg",
      bio: "React Consultant"
    },
    publishedAt: "2024-01-08",
    readTime: 10,
    category: "Web Development",
    tags: ["React", "Scalability", "Architecture", "Performance"],
    image: "/blog/scalable-react.jpg",
    slug: "building-scalable-react-apps",
    views: 734,
    likes: 45,
    comments: 12,
    featured: false
  },
  {
    id: "5",
    title: "CSS Grid vs Flexbox: When to Use What",
    excerpt: "A practical guide to choosing between CSS Grid and Flexbox for your layout needs.",
    content: "Full content here...",
    author: {
      name: "Lisa Park",
      avatar: "/avatars/lisa.jpg",
      bio: "CSS Specialist"
    },
    publishedAt: "2024-01-05",
    readTime: 7,
    category: "CSS",
    tags: ["CSS", "Grid", "Flexbox", "Layout", "Design"],
    image: "/blog/css-grid-flexbox.jpg",
    slug: "css-grid-vs-flexbox",
    views: 1123,
    likes: 78,
    comments: 31,
    featured: false
  },
  {
    id: "6",
    title: "Database Optimization Techniques for Modern Applications",
    excerpt: "Learn how to optimize your database queries and structure for better performance and scalability.",
    content: "Full content here...",
    author: {
      name: "David Kim",
      avatar: "/avatars/david.jpg",
      bio: "Database Architect"
    },
    publishedAt: "2024-01-03",
    readTime: 14,
    category: "Database",
    tags: ["Database", "SQL", "Performance", "Optimization"],
    image: "/blog/database-optimization.jpg",
    slug: "database-optimization-techniques",
    views: 645,
    likes: 34,
    comments: 9,
    featured: false
  }
];

const categories = [
  "All",
  "Web Development",
  "Programming",
  "Artificial Intelligence",
  "CSS",
  "Database",
  "DevOps",
  "Mobile Development",
  "UI/UX Design"
];

const popularTags = [
  "React", "TypeScript", "Next.js", "JavaScript", "CSS", "Node.js",
  "Python", "AI", "Machine Learning", "DevOps", "Database", "Performance"
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(6);

  // Filter and search posts
  useEffect(() => {
    setIsLoading(true);
    
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.name.toLowerCase().includes(query)
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case "popular":
          return b.views - a.views;
        case "most-liked":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
    
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  }, [posts, searchQuery, selectedCategory, selectedTag, sortBy]);

  const loadMorePosts = () => {
    setVisiblePosts(prev => prev + 6);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const FeaturedPost = ({ post }: { post: BlogPost }) => (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative h-64 lg:h-full min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 z-10" />
          <Image
            src={post.image || "/placeholder.jpg"}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              Featured
            </Badge>
          </div>
        </div>
        
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </div>
            <Badge variant="secondary" className="capitalize">
              {post.category}
            </Badge>
          </div>

          <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">{post.author.bio}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {post.likes} likes
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {post.comments} comments
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild className="flex-1">
              <Link href={`/blog/${post.slug}`}>
                Read Article
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const BlogPostCard = ({ post }: { post: BlogPost }) => (
    <Card className="group h-full overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={post.image || "/placeholder.jpg"}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {post.featured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
              Featured
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(post.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime} min
          </div>
        </div>

        <Badge variant="outline" className="mb-3 capitalize">
          {post.category}
        </Badge>

        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-primary/20"
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {post.author.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm font-medium">{post.author.name}</span>
        </div>
        
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/blog/${post.slug}`} className="flex items-center gap-1">
            Read
            <ArrowRight className="w-3 h-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

  const PostSkeleton = () => (
    <Card className="h-full overflow-hidden border">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Our Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover insights, tutorials, and stories from our community of experts
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 focus:bg-white/20 focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Categories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">Stay Updated</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Get the latest articles delivered to your inbox
                  </p>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Enter your email" 
                      className="bg-white"
                    />
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCategory === "All" ? "All Articles" : selectedCategory}
                  {selectedTag && `: #${selectedTag}`}
                </h2>
                <p className="text-muted-foreground">
                  {filteredPosts.length} articles found
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured Posts */}
            {!searchQuery && selectedCategory === "All" && !selectedTag && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Badge variant="secondary" className="mr-2">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  Editor's Picks
                </h3>
                <div className="space-y-6">
                  {filteredPosts
                    .filter(post => post.featured)
                    .slice(0, 2)
                    .map(post => (
                      <FeaturedPost key={post.id} post={post} />
                    ))}
                </div>
              </div>
            )}

            {/* All Posts Grid */}
            <div>
              <h3 className="text-xl font-semibold mb-6">
                {searchQuery || selectedCategory !== "All" || selectedTag 
                  ? "Search Results" 
                  : "Latest Articles"
                }
              </h3>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedTag("");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPosts.slice(0, visiblePosts).map(post => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visiblePosts < filteredPosts.length && (
                    <div className="text-center mt-12">
                      <Button 
                        onClick={loadMorePosts}
                        variant="outline"
                        size="lg"
                        className="px-8"
                      >
                        Load More Articles
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}