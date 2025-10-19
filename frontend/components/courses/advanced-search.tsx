// // components/courses/advanced-search.tsx
// "use client"

// import { useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Slider } from "@/components/ui/slider"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { 
//   Search, 
//   Filter, 
//   X,
//   Star,
//   Clock,
//   DollarSign,
//   Sparkles,
//   SlidersHorizontal,
//   Languages,
//   Users,
//   BookOpen,
//   Target,
//   Zap,
//   Award,
//   Download,
//   FileText,
//   PlayCircle,
//   Code
// } from "lucide-react"
// import type { SearchFilters } from "@/lib/types"

// interface AdvancedSearchProps {
//   onSearch: (filters: SearchFilters) => void
//   categories: string[]
//   initialFilters: SearchFilters
// }

// const LEVELS = [
//   { value: "Beginner", label: "Beginner", icon: BookOpen },
//   { value: "Intermediate", label: "Intermediate", icon: Target },
//   { value: "Advanced", label: "Advanced", icon: Zap }
// ]

// const LANGUAGES = [
//   { value: "english", label: "English", flag: "🇺🇸" },
//   { value: "spanish", label: "Spanish", flag: "🇪🇸" },
//   { value: "french", label: "French", flag: "🇫🇷" },
//   { value: "german", label: "German", flag: "🇩🇪" },
//   { value: "chinese", label: "Chinese", flag: "🇨🇳" },
//   { value: "japanese", label: "Japanese", flag: "🇯🇵" },
//   { value: "hindi", label: "Hindi", flag: "🇮🇳" },
//   { value: "arabic", label: "Arabic", flag: "🇸🇦" }
// ]

// const FEATURES = [
//   { value: "Certificate", label: "Certificate", icon: Award },
//   { value: "Quizzes", label: "Quizzes", icon: FileText },
//   { value: "Exercises", label: "Exercises", icon: Code },
//   { value: "Downloadable", label: "Downloadable", icon: Download },
//   { value: "Subtitles", label: "Subtitles", icon: PlayCircle },
//   { value: "Code Examples", label: "Code Examples", icon: Code },
//   { value: "Lifetime Access", label: "Lifetime Access", icon: Users },
//   { value: "Mobile Access", label: "Mobile Access", icon: PlayCircle }
// ]

// const SORT_OPTIONS = [
//   { value: "newest", label: "Newest First" },
//   { value: "popular", label: "Most Popular" },
//   { value: "rating", label: "Highest Rated" },
//   { value: "price-low", label: "Price: Low to High" },
//   { value: "price-high", label: "Price: High to Low" },
//   { value: "duration-short", label: "Duration: Shortest First" },
//   { value: "duration-long", label: "Duration: Longest First" }
// ]

// export function AdvancedSearch({ onSearch, categories, initialFilters }: AdvancedSearchProps) {
//   const [filters, setFilters] = useState<SearchFilters>(initialFilters)
//   const [activeFilterCount, setActiveFilterCount] = useState(0)
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const searchInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     setFilters(initialFilters)
//   }, [initialFilters])

//   // Calculate active filter count
//   useEffect(() => {
//     let count = 0
//     if (filters.query) count++
//     if (filters.categories.length > 0) count++
//     if (filters.levels.length > 0) count++
//     if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++
//     if (filters.durationRange[0] > 0 || filters.durationRange[1] < 50) count++
//     if (filters.rating > 0) count++
//     if (filters.features.length > 0) count++
//     if (filters.language !== "all") count++
//     if (filters.sortBy !== "newest") count++
    
//     setActiveFilterCount(count)
//   }, [filters])

//   const handleSearch = () => {
//     const searchFilters = {
//       ...filters,
//       query: filters.query.trim()
//     }
//     onSearch(searchFilters)
//   }

//   // Auto-search when typing stops
//   useEffect(() => {
//     if (filters.query === "") {
//       const timer = setTimeout(() => {
//         handleSearch()
//       }, 500)
//       return () => clearTimeout(timer)
//     }
//   }, [filters.query])

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSearch()
//     }
//   }

//   const clearFilters = () => {
//     const clearedFilters: SearchFilters = {
//       query: "",
//       categories: [],
//       levels: [],
//       priceRange: [0, 500],
//       durationRange: [0, 50],
//       rating: 0,
//       features: [],
//       language: "all",
//       sortBy: "newest",
//     }
//     setFilters(clearedFilters)
//     onSearch(clearedFilters)
//     setIsDialogOpen(false)
//   }

//   const clearSingleFilter = (filterType: keyof SearchFilters, value?: any) => {
//     if (filterType === 'query') {
//       setFilters(prev => ({ ...prev, query: "" }))
//     } else if (filterType === 'categories' && value) {
//       setFilters(prev => ({ 
//         ...prev, 
//         categories: prev.categories.filter(c => c !== value) 
//       }))
//     } else if (filterType === 'levels' && value) {
//       setFilters(prev => ({ 
//         ...prev, 
//         levels: prev.levels.filter(l => l !== value) 
//       }))
//     } else if (filterType === 'features' && value) {
//       setFilters(prev => ({ 
//         ...prev, 
//         features: prev.features.filter(f => f !== value) 
//       }))
//     } else {
//       const defaults: Partial<SearchFilters> = {
//         categories: [],
//         levels: [],
//         priceRange: [0, 500],
//         durationRange: [0, 50],
//         rating: 0,
//         features: [],
//         language: "all",
//         sortBy: "newest",
//       }
//       setFilters(prev => ({ ...prev, [filterType]: defaults[filterType] }))
//     }
//   }

//   const applyFilters = () => {
//     handleSearch()
//     setIsDialogOpen(false)
//   }

//   return (
//     <div className="space-y-4">
//       {/* Search Bar with Animation */}
//       <motion.div 
//         className="flex gap-3"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="flex-1 relative">
//           <motion.div
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.2 }}
//           >
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//             <Input
//               ref={searchInputRef}
//               placeholder="Search courses, instructors, or topics..."
//               value={filters.query}
//               onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
//               onKeyPress={handleKeyPress}
//               className="pl-10 transition-all duration-300 hover:border-primary/50 focus:border-primary"
//             />
//             {filters.query && (
//               <motion.button
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 onClick={() => setFilters(prev => ({ ...prev, query: "" }))}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//               >
//                 <X className="h-4 w-4" />
//               </motion.button>
//             )}
//           </motion.div>
//         </div>
        
//         <motion.div
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           transition={{ duration: 0.2 }}
//         >
//           <Button onClick={handleSearch} className="transition-all duration-300">
//             <Search className="h-4 w-4 mr-2" />
//             Search
//           </Button>
//         </motion.div>

//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               transition={{ duration: 0.2 }}
//             >
//               <Button variant="outline" className="relative transition-all duration-300">
//                 <SlidersHorizontal className="h-4 w-4 mr-2" />
//                 Filters
//                 {activeFilterCount > 0 && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ type: "spring", stiffness: 500, damping: 15 }}
//                   >
//                     <Badge 
//                       variant="destructive" 
//                       className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
//                     >
//                       {activeFilterCount}
//                     </Badge>
//                   </motion.div>
//                 )}
//               </Button>
//             </motion.div>
//           </DialogTrigger>
//           <DialogContent className="max-w-6xl lg:min-w-6xl  w-full max-h-[90vh] overflow bg-background">
//             <DialogHeader>
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="w-full "
//               >
//                 <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
//                   <Sparkles className="h-6 w-6 text-primary" />
//                   Advanced Course Filters
//                 </DialogTitle>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Refine your search with powerful filters to find the perfect courses
//                 </p>
//               </motion.div>
//             </DialogHeader>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 overflow-y-auto custom-scrollbar-thin pr-4 max-h-[60vh]">
//               {/* Categories */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <span className="w-2 h-2 bg-primary rounded-full"></span>
//                   Categories
//                 </h3>
//                 <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin pr-2">
//                   {categories.map((category, index) => (
//                     <motion.div 
//                       key={category} 
//                       className="flex items-center space-x-2"
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.1 + index * 0.05 }}
//                     >
//                       <Checkbox
//                         id={`category-${category}`}
//                         checked={filters.categories.includes(category)}
//                         onCheckedChange={(checked) => {
//                           const newCategories = checked
//                             ? [...filters.categories, category]
//                             : filters.categories.filter((c) => c !== category)
//                           setFilters(prev => ({ ...prev, categories: newCategories }))
//                         }}
//                       />
//                       <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex-1">
//                         {category}
//                       </Label>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>

//               {/* Levels */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                   Difficulty Level
//                 </h3>
//                 <div className="space-y-2">
//                   {LEVELS.map((level, index) => {
//                     const IconComponent = level.icon
//                     return (
//                       <motion.div 
//                         key={level.value} 
//                         className="flex items-center space-x-2"
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2 + index * 0.05 }}
//                       >
//                         <Checkbox
//                           id={`level-${level.value}`}
//                           checked={filters.levels.includes(level.value)}
//                           onCheckedChange={(checked) => {
//                             const newLevels = checked
//                               ? [...filters.levels, level.value]
//                               : filters.levels.filter((l) => l !== level.value)
//                             setFilters(prev => ({ ...prev, levels: newLevels }))
//                           }}
//                         />
//                         <Label htmlFor={`level-${level.value}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-2 flex-1">
//                           <IconComponent className="h-3 w-3" />
//                           {level.label}
//                         </Label>
//                       </motion.div>
//                     )
//                   })}
//                 </div>
//               </motion.div>

//               {/* Language */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <Languages className="h-4 w-4 text-green-500" />
//                   Language
//                 </h3>
//                 <Select
//                   value={filters.language}
//                   onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select language" />
//                   </SelectTrigger>
//                   <SelectContent className="custom-scrollbar-thin max-h-60">
//                     <SelectItem value="all">All Languages</SelectItem>
//                     {LANGUAGES.map((language) => (
//                       <SelectItem key={language.value} value={language.value}>
//                         <span className="flex items-center gap-2">
//                           <span className="text-base">{language.flag}</span>
//                           {language.label}
//                         </span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </motion.div>

//               {/* Price Range */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.4 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-green-500" />
//                   Price Range
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="text-center">
//                     <span className="text-xl font-bold text-primary">
//                       ${filters.priceRange[0]} - ${filters.priceRange[1]}
//                     </span>
//                   </div>
//                   <Slider
//                     value={filters.priceRange}
//                     onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
//                     max={500}
//                     step={10}
//                   />
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>$0</span>
//                     <span>$500</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Duration */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <Clock className="h-4 w-4 text-orange-500" />
//                   Course Duration
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="text-center">
//                     <span className="text-xl font-bold text-primary">
//                       {filters.durationRange[0]} - {filters.durationRange[1]} hours
//                     </span>
//                   </div>
//                   <Slider
//                     value={filters.durationRange}
//                     onValueChange={(value) => setFilters(prev => ({ ...prev, durationRange: value as [number, number] }))}
//                     max={50}
//                     step={5}
//                   />
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>0h</span>
//                     <span>50h</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Rating */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.6 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
//                   Minimum Rating
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="text-center">
//                     <span className="text-xl font-bold text-primary flex items-center justify-center gap-2">
//                       {filters.rating}
//                       <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
//                     </span>
//                   </div>
//                   <Slider
//                     value={[filters.rating]}
//                     onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
//                     max={5}
//                     step={0.5}
//                   />
//                   <div className="flex justify-between text-sm text-muted-foreground">
//                     <span>0</span>
//                     <span>5</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Features */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.7 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                   Course Features
//                 </h3>
//                 <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin pr-2">
//                   {FEATURES.map((feature, index) => {
//                     const IconComponent = feature.icon
//                     return (
//                       <motion.div 
//                         key={feature.value} 
//                         className="flex items-center space-x-2"
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.7 + index * 0.05 }}
//                       >
//                         <Checkbox
//                           id={`feature-${feature.value}`}
//                           checked={filters.features.includes(feature.value)}
//                           onCheckedChange={(checked) => {
//                             const newFeatures = checked
//                               ? [...filters.features, feature.value]
//                               : filters.features.filter((f) => f !== feature.value)
//                             setFilters(prev => ({ ...prev, features: newFeatures }))
//                           }}
//                         />
//                         <Label htmlFor={`feature-${feature.value}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-2 flex-1">
//                           <IconComponent className="h-3 w-3" />
//                           {feature.label}
//                         </Label>
//                       </motion.div>
//                     )
//                   })}
//                 </div>
//               </motion.div>

//               {/* Sort By */}
//               <motion.div 
//                 className="space-y-4 p-4 rounded-lg bg-card border"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.8 }}
//               >
//                 <h3 className="font-semibold flex items-center gap-2">
//                   <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
//                   Sort By
//                 </h3>
//                 <Select
//                   value={filters.sortBy}
//                   onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Sort by..." />
//                   </SelectTrigger>
//                   <SelectContent className="custom-scrollbar-thin max-h-60">
//                     {SORT_OPTIONS.map((option) => (
//                       <SelectItem key={option.value} value={option.value}>
//                         {option.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </motion.div>
//             </div>

//             <motion.div 
//               className="flex justify-between pt-4 border-t mt-4"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.9 }}
//             >
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button variant="outline" onClick={clearFilters} className="transition-all duration-300">
//                   <X className="h-4 w-4 mr-2" />
//                   Clear All Filters
//                 </Button>
//               </motion.div>
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button variant={"default"} onClick={applyFilters} className="transition-all cursor-pointer duration-300 bg-gradient-to-r  hover:from-primary/50 hover:to-purple-600/5">
//                   <Filter className="h-4 w-4 mr-2" />
//                   Apply Filters
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </DialogContent>
//         </Dialog>
//       </motion.div>

//       {/* Active Filters with Animation */}
//       <AnimatePresence>
//         {activeFilterCount > 0 && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border"
//           >
//             <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
//               <Filter className="h-3 w-3" />
//               Active filters:
//             </span>
            
//             {filters.query && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   🔍 "{filters.query}"
//                   <motion.button 
//                     onClick={() => clearSingleFilter('query')}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             )}
            
//             {filters.categories.map(category => (
//               <motion.div
//                 key={category}
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   📚 {category}
//                   <motion.button 
//                     onClick={() => clearSingleFilter('categories', category)}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             ))}
            
//             {filters.levels.map(level => (
//               <motion.div
//                 key={level}
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   🎯 {level}
//                   <motion.button 
//                     onClick={() => clearSingleFilter('levels', level)}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             ))}
            
//             {filters.rating > 0 && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   ⭐ {filters.rating}+
//                   <motion.button 
//                     onClick={() => clearSingleFilter('rating')}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             )}

//             {filters.language !== "all" && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   🌐 {LANGUAGES.find(l => l.value === filters.language)?.label}
//                   <motion.button 
//                     onClick={() => clearSingleFilter('language')}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             )}

//             {filters.sortBy !== "newest" && (
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 500, damping: 15 }}
//               >
//                 <Badge variant="secondary" className="flex items-center gap-1">
//                   ↕️ {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
//                   <motion.button 
//                     onClick={() => clearSingleFilter('sortBy')}
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </Badge>
//               </motion.div>
//             )}

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={clearFilters}
//                 className="text-xs h-6 px-2 ml-auto"
//               >
//                 Clear all
//               </Button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }


// components/courses/advanced-search.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  X,
  Star,
  Clock,
  DollarSign,
  Sparkles,
  SlidersHorizontal,
  Languages,
  Users,
  BookOpen,
  Target,
  Zap,
  Award,
  Download,
  FileText,
  PlayCircle,
  Code
} from "lucide-react"
import type { SearchFilters } from "@/lib/types"

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories: string[]
  initialFilters: SearchFilters
}

const LEVELS = [
  { value: "Beginner", label: "Beginner", icon: BookOpen },
  { value: "Intermediate", label: "Intermediate", icon: Target },
  { value: "Advanced", label: "Advanced", icon: Zap }
]

const LANGUAGES = [
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "chinese", label: "Chinese", flag: "🇨🇳" },
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "hindi", label: "Hindi", flag: "🇮🇳" },
  { value: "arabic", label: "Arabic", flag: "🇸🇦" }
]

const FEATURES = [
  { value: "Certificate", label: "Certificate", icon: Award },
  { value: "Quizzes", label: "Quizzes", icon: FileText },
  { value: "Exercises", label: "Exercises", icon: Code },
  { value: "Downloadable", label: "Downloadable", icon: Download },
  { value: "Subtitles", label: "Subtitles", icon: PlayCircle },
  { value: "Code Examples", label: "Code Examples", icon: Code },
  { value: "Lifetime Access", label: "Lifetime Access", icon: Users },
  { value: "Mobile Access", label: "Mobile Access", icon: PlayCircle }
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "duration-short", label: "Duration: Shortest First" },
  { value: "duration-long", label: "Duration: Longest First" }
]

export function AdvancedSearch({ onSearch, categories, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Calculate active filter count
  useEffect(() => {
    let count = 0
    if (filters.query) count++
    if (filters.categories.length > 0) count++
    if (filters.levels.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++
    if (filters.durationRange[0] > 0 || filters.durationRange[1] < 50) count++
    if (filters.rating > 0) count++
    if (filters.features.length > 0) count++
    if (filters.language !== "all") count++
    if (filters.sortBy !== "newest") count++
    
    setActiveFilterCount(count)
  }, [filters])

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      query: filters.query.trim()
    }
    onSearch(searchFilters)
  }

  // Auto-search when typing stops
  useEffect(() => {
    if (filters.query === "") {
      const timer = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [filters.query])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: "",
      categories: [],
      levels: [],
      priceRange: [0, 500],
      durationRange: [0, 50],
      rating: 0,
      features: [],
      language: "all",
      sortBy: "newest",
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
    setIsDialogOpen(false)
  }

  const clearSingleFilter = (filterType: keyof SearchFilters, value?: any) => {
    if (filterType === 'query') {
      setFilters(prev => ({ ...prev, query: "" }))
    } else if (filterType === 'categories' && value) {
      setFilters(prev => ({ 
        ...prev, 
        categories: prev.categories.filter(c => c !== value) 
      }))
    } else if (filterType === 'levels' && value) {
      setFilters(prev => ({ 
        ...prev, 
        levels: prev.levels.filter(l => l !== value) 
      }))
    } else if (filterType === 'features' && value) {
      setFilters(prev => ({ 
        ...prev, 
        features: prev.features.filter(f => f !== value) 
      }))
    } else {
      const defaults: Partial<SearchFilters> = {
        categories: [],
        levels: [],
        priceRange: [0, 500],
        durationRange: [0, 50],
        rating: 0,
        features: [],
        language: "all",
        sortBy: "newest",
      }
      setFilters(prev => ({ ...prev, [filterType]: defaults[filterType] }))
    }
  }

  const applyFilters = () => {
    handleSearch()
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar - No Animation */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}
              placeholder="Search courses, instructors, or topics..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="pl-10 transition-all duration-300 hover:border-primary/50 focus:border-primary"
            />
            {filters.query && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, query: "" }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <Button onClick={handleSearch} className="transition-all duration-300">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative transition-all duration-300">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl lg:min-w-6xl w-full max-h-[90vh] overflow bg-background">
            <DialogHeader>
              <div className="w-full">
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Advanced Course Filters
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Refine your search with powerful filters to find the perfect courses
                </p>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 overflow-y-auto custom-scrollbar-thin pr-4 max-h-[60vh]">
              {/* Categories */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Categories
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin pr-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          const newCategories = checked
                            ? [...filters.categories, category]
                            : filters.categories.filter((c) => c !== category)
                          setFilters(prev => ({ ...prev, categories: newCategories }))
                        }}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex-1">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Levels */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Difficulty Level
                </h3>
                <div className="space-y-2">
                  {LEVELS.map((level) => {
                    const IconComponent = level.icon
                    return (
                      <div key={level.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level.value}`}
                          checked={filters.levels.includes(level.value)}
                          onCheckedChange={(checked) => {
                            const newLevels = checked
                              ? [...filters.levels, level.value]
                              : filters.levels.filter((l) => l !== level.value)
                            setFilters(prev => ({ ...prev, levels: newLevels }))
                          }}
                        />
                        <Label htmlFor={`level-${level.value}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-2 flex-1">
                          <IconComponent className="h-3 w-3" />
                          {level.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Language */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4 text-green-500" />
                  Language
                </h3>
                <Select
                  value={filters.language}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="custom-scrollbar-thin max-h-60">
                    <SelectItem value="all">All Languages</SelectItem>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-base">{language.flag}</span>
                          {language.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Price Range */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xl font-bold text-primary">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    </span>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={500}
                    step={10}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$0</span>
                    <span>$500</span>
                  </div>
                </div>
              </motion.div>

              {/* Duration */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Course Duration
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xl font-bold text-primary">
                      {filters.durationRange[0]} - {filters.durationRange[1]} hours
                    </span>
                  </div>
                  <Slider
                    value={filters.durationRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, durationRange: value as [number, number] }))}
                    max={50}
                    step={5}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0h</span>
                    <span>50h</span>
                  </div>
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  Minimum Rating
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                      {filters.rating}
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    </span>
                  </div>
                  <Slider
                    value={[filters.rating]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                    max={5}
                    step={0.5}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>
              </motion.div>

              {/* Features */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Course Features
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-thin pr-2">
                  {FEATURES.map((feature) => {
                    const IconComponent = feature.icon
                    return (
                      <div key={feature.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature.value}`}
                          checked={filters.features.includes(feature.value)}
                          onCheckedChange={(checked) => {
                            const newFeatures = checked
                              ? [...filters.features, feature.value]
                              : filters.features.filter((f) => f !== feature.value)
                            setFilters(prev => ({ ...prev, features: newFeatures }))
                          }}
                        />
                        <Label htmlFor={`feature-${feature.value}`} className="text-sm cursor-pointer hover:text-primary transition-colors flex items-center gap-2 flex-1">
                          <IconComponent className="h-3 w-3" />
                          {feature.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Sort By */}
              <motion.div 
                className="space-y-4 p-4 rounded-lg bg-card border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Sort By
                </h3>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="custom-scrollbar-thin max-h-60">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            <motion.div 
              className="flex justify-between pt-4 border-t mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button variant="outline" onClick={clearFilters} className="transition-all duration-300">
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
              <Button variant={"default"} onClick={applyFilters} className="transition-all cursor-pointer duration-300 bg-gradient-to-r hover:from-primary/50 hover:to-purple-600/5">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </motion.div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters - No Animation */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Active filters:
          </span>
          
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🔍 "{filters.query}"
              <button onClick={() => clearSingleFilter('query')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              📚 {category}
              <button onClick={() => clearSingleFilter('categories', category)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.levels.map(level => (
            <Badge key={level} variant="secondary" className="flex items-center gap-1">
              🎯 {level}
              <button onClick={() => clearSingleFilter('levels', level)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.rating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ⭐ {filters.rating}+
              <button onClick={() => clearSingleFilter('rating')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.language !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🌐 {LANGUAGES.find(l => l.value === filters.language)?.label}
              <button onClick={() => clearSingleFilter('language')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.sortBy !== "newest" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ↕️ {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
              <button onClick={() => clearSingleFilter('sortBy')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6 px-2 ml-auto"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  ) 
}