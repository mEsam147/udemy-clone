// components/courses/course-qa.tsx - Create new file
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import type { QAItem } from "@/lib/types";
import { useCourseQA, usePostQuestion } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

interface CourseQAProps {
  courseId: string;
}

export function CourseQA({ courseId }: CourseQAProps) {
  const { data: qaItems = [] } = useCourseQA(courseId);
  const postQuestionMutation = usePostQuestion();
  const { toast } = useToast();

  const [newQuestion, setNewQuestion] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || postQuestionMutation.isPending) return;

    setIsSubmitting(true);
    try {
      await postQuestionMutation.mutateAsync({
        courseId,
        question: newQuestion.trim(),
      });

      setNewQuestion("");
      toast({
        title: "Question Posted!",
        description:
          "Your question has been submitted. The instructor will respond soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (qaItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to ask a question about this course.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about this course..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitQuestion()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ask Question Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Ask a Question</h3>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about this course..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmitQuestion()}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Q&A Items */}
      <div className="space-y-4">
        {qaItems.map((qaItem) => (
          <Card key={qaItem.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={qaItem.user.avatar} />
                  <AvatarFallback>{qaItem.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {qaItem.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(qaItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{qaItem.question}</p>
                </div>
              </div>
            </CardHeader>

            {qaItem.answer && (
              <CardContent className="pt-0 pb-3 border-t">
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">{qaItem.answer}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Answered by instructor •{" "}
                    {new Date(qaItem.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            )}

            {/* Answers Section */}
            {qaItem.answers && qaItem.answers.length > 0 && (
              <CardContent className="pt-0 space-y-3">
                {qaItem.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="border-l-2 border-gray-200 pl-3"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={answer.user.avatar} />
                        <AvatarFallback>
                          {answer.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">
                            {answer.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed mt-1">
                          {answer.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
