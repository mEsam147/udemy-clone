// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
// import { Course, CourseFormData } from "@/lib/types";

// interface EditCourseModalProps {
//   isEditModalOpen: boolean;
//   setIsEditModalOpen: (open: boolean) => void;
//   selectedCourse: Course | null;
//   imagePreview: string;
//   setImagePreview: (preview: string) => void;
//   imageInputRef: React.RefObject<HTMLInputElement>;
//   watchedImage: File | null;
//   setValue: any;
//   register: any;
//   errors: any;
//   watch: any;
//   handleSubmit: any;
//   updateCourseMutation: any;
// }

// export function EditCourseModal({
//   isEditModalOpen,
//   setIsEditModalOpen,
//   selectedCourse,
//   imagePreview,
//   setImagePreview,
//   imageInputRef,
//   watchedImage,
//   setValue,
//   register,
//   errors,
//   watch,
//   handleSubmit,
//   updateCourseMutation,
// }: EditCourseModalProps) {
//   return (
//     <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Edit Course</DialogTitle>
//           <DialogDescription>
//             Update your course information below.
//           </DialogDescription>
//         </DialogHeader>
//         <form
//           onSubmit={handleSubmit((data: CourseFormData) =>
//             updateCourseMutation.mutate(data)
//           )}
//           className="space-y-6"
//         >
//           {/* Image Upload Section */}
//           <div className="space-y-4">
//             <Label htmlFor="courseImage">Course Image</Label>
//             <div className="flex flex-col sm:flex-row gap-6 items-start">
//               {/* Image Preview */}
//               <div className="flex-shrink-0">
//                 <div className="relative w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
//                   {imagePreview ? (
//                     <img
//                       src={imagePreview}
//                       alt="Course preview"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : selectedCourse?.image ? (
//                     <img
//                       src={selectedCourse.image}
//                       alt="Current course"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                       <ImageIcon className="h-8 w-8 text-gray-400" />
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Upload Controls */}
//               <div className="flex-1 space-y-3">
//                 <div className="flex gap-3">
//                   <Input
//                     id="courseImage"
//                     type="file"
//                     accept="image/*"
//                     ref={imageInputRef}
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         setValue("image", file);
//                       }
//                     }}
//                     className="flex-1"
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => {
//                       setValue("image", null);
//                       setImagePreview("");
//                       if (imageInputRef.current) {
//                         imageInputRef.current.value = "";
//                       }
//                     }}
//                     disabled={!watchedImage && !selectedCourse?.image}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <p className="text-sm text-gray-500">
//                   Recommended: 1280x720px JPG or PNG. Max 5MB.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Course Details */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="title">Course Title *</Label>
//               <Input
//                 id="title"
//                 {...register("title", { required: "Title is required" })}
//                 placeholder="Enter course title"
//               />
//               {errors.title && (
//                 <p className="text-sm text-red-500">{errors.title.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="category">Category *</Label>
//               <Input
//                 id="category"
//                 {...register("category", {
//                   required: "Category is required",
//                 })}
//                 placeholder="Enter category"
//               />
//               {errors.category && (
//                 <p className="text-sm text-red-500">
//                   {errors.category.message}
//                 </p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="price">Price ($) *</Label>
//               <Input
//                 id="price"
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 {...register("price", {
//                   required: "Price is required",
//                   min: { value: 0, message: "Price must be positive" },
//                 })}
//                 placeholder="0.00"
//               />
//               {errors.price && (
//                 <p className="text-sm text-red-500">{errors.price.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="level">Level *</Label>
//               <Select
//                 onValueChange={(value) =>
//                   setValue("level", value, { shouldValidate: true })
//                 }
//                 defaultValue={selectedCourse?.level}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select level" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="beginner">Beginner</SelectItem>
//                   <SelectItem value="intermediate">Intermediate</SelectItem>
//                   <SelectItem value="advanced">Advanced</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="status">Status *</Label>
//               <Select
//                 onValueChange={(value) =>
//                   setValue("status", value, { shouldValidate: true })
//                 }
//                 defaultValue={selectedCourse?.status || (selectedCourse?.isPublished ? "published" : "draft")}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="published">Published</SelectItem>
//                   <SelectItem value="archived">Archived</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description *</Label>
//             <Textarea
//               id="description"
//               {...register("description", {
//                 required: "Description is required",
//                 minLength: {
//                   value: 50,
//                   message: "Description must be at least 50 characters",
//                 },
//               })}
//               placeholder="Enter course description (minimum 50 characters)"
//               rows={4}
//             />
//             {errors.description && (
//               <p className="text-sm text-red-500">
//                 {errors.description.message}
//               </p>
//             )}
//             <p className="text-sm text-gray-500">
//               {watch("description")?.length || 0}/50 characters minimum
//             </p>
//           </div>

//           <DialogFooter>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setIsEditModalOpen(false);
//                 setImagePreview("");
//               }}
//               disabled={updateCourseMutation.isPending}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={updateCourseMutation.isPending}
//               className="gap-2"
//             >
//               {updateCourseMutation.isPending ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle2 className="h-4 w-4" />
//                   Update Course
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// Make sure your EditCourseModal has proper form validation
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, X, Loader2, CheckCircle2, Plus } from "lucide-react";
import { Course, CourseFormData } from "@/lib/types";
import { useEffect } from "react";

interface EditCourseModalProps {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  imagePreview: string;
  setImagePreview: (preview: string) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  watchedImage: File | null;
  setValue: any;
  register: any;
  errors: any;
  watch: any;
  handleSubmit: any;
  updateCourseMutation: any;
}

export function EditCourseModal({
  isEditModalOpen,
  setIsEditModalOpen,
  selectedCourse,
  imagePreview,
  setImagePreview,
  imageInputRef,
  watchedImage,
  setValue,
  register,
  errors,
  watch,
  handleSubmit,
  updateCourseMutation,
}: EditCourseModalProps) {

  // Initialize form when course data changes
  useEffect(() => {
    if (selectedCourse && isEditModalOpen) {
      setValue("title", selectedCourse.title || "");
      setValue("description", selectedCourse.description || "");
      setValue("category", selectedCourse.category || "");
      setValue("price", selectedCourse.price || 0);
      setValue("level", selectedCourse.level?.toLowerCase() || "beginner");
      setValue("status", selectedCourse.isPublished ? "published" : "draft");
      
      // Set image preview
      setImagePreview(selectedCourse.image || "");
    }
  }, [selectedCourse, isEditModalOpen, setValue, setImagePreview]);

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setImagePreview(selectedCourse?.image || "");
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update your course information below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data: CourseFormData) => {
            // Ensure level is in correct format
            const submitData = {
              ...data,
              level: data.level.toLowerCase()
            };
            updateCourseMutation.mutate(submitData);
          })}
          className="space-y-6"
        >
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="courseImage">Course Image</Label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                <div className="relative w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  ) : selectedCourse?.image ? (
                    <img
                      src={selectedCourse.image}
                      alt="Current course"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-3">
                  <Input
                    id="courseImage"
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setValue("image", file);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue("image", null);
                      setImagePreview(selectedCourse?.image || "");
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                    disabled={!watchedImage && !selectedCourse?.image}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Recommended: 1280x720px JPG or PNG. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter course title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register("category", {
                  required: "Category is required",
                })}
                placeholder="Enter category"
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("level", value, { shouldValidate: true })
                }
                defaultValue={selectedCourse?.level?.toLowerCase()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("status", value, { shouldValidate: true })
                }
                defaultValue={selectedCourse?.isPublished ? "published" : "draft"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 50,
                  message: "Description must be at least 50 characters",
                },
              })}
              placeholder="Enter course description (minimum 50 characters)"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {watch("description")?.length || 0}/50 characters minimum
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleModalClose}
              disabled={updateCourseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCourseMutation.isPending}
              className="gap-2"
            >
              {updateCourseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Update Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}