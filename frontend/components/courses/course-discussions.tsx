"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, ThumbsUp, Flag } from "lucide-react";
import type { Course, User } from "@/lib/types";

interface Discussion {
  id: string;
  user: User;
  content: string;
  created_at: string;
  likes: number;
  replies: Reply[];
  is_instructor_response: boolean;
  lesson_id?: string;
  timestamp?: number; // For video-specific discussions
}

interface Reply {
  id: string;
  user: User;
  content: string;
  created_at: string;
  likes: number;
  is_instructor_response: boolean;
}

interface CourseDiscussionsProps {
  course: Course;
  currentLessonId?: string;
  currentUser: User;
}

export function CourseDiscussions({
  course,
  currentLessonId,
  currentUser,
}: CourseDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newDiscussion, setNewDiscussion] = useState("");
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [showReplyForm, setShowReplyForm] = useState<{
    [key: string]: boolean;
  }>({});

  const handlePostDiscussion = () => {
    if (!newDiscussion.trim()) return;

    const discussion: Discussion = {
      id: `discussion-${Date.now()}`,
      user: currentUser,
      content: newDiscussion,
      created_at: new Date().toISOString(),
      likes: 0,
      replies: [],
      is_instructor_response: currentUser.role === "instructor",
      lesson_id: currentLessonId,
    };

    setDiscussions([discussion, ...discussions]);
    setNewDiscussion("");
  };

  const handlePostReply = (discussionId: string) => {
    const content = replyContent[discussionId];
    if (!content?.trim()) return;

    const reply: Reply = {
      id: `reply-${Date.now()}`,
      user: currentUser,
      content,
      created_at: new Date().toISOString(),
      likes: 0,
      is_instructor_response: currentUser.role === "instructor",
    };

    setDiscussions(
      discussions.map((d) =>
        d.id === discussionId
          ? {
              ...d,
              replies: [...d.replies, reply],
            }
          : d
      )
    );

    setReplyContent({ ...replyContent, [discussionId]: "" });
    setShowReplyForm({ ...showReplyForm, [discussionId]: false });
  };

  const toggleLike = (discussionId: string, replyId?: string) => {
    setDiscussions(
      discussions.map((d) => {
        if (replyId) {
          if (d.id === discussionId) {
            return {
              ...d,
              replies: d.replies.map((r) =>
                r.id === replyId
                  ? {
                      ...r,
                      likes: r.likes + 1,
                    }
                  : r
              ),
            };
          }
        } else if (d.id === discussionId) {
          return {
            ...d,
            likes: d.likes + 1,
          };
        }
        return d;
      })
    );
  };

  const handleReport = (discussionId: string, replyId?: string) => {
    // TODO: Implement report functionality
    console.log("Reported:", { discussionId, replyId });
  };

  return (
    <div className="space-y-6">
      {/* New Discussion Form */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Start a Discussion</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What would you like to discuss?"
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handlePostDiscussion}>Post Discussion</Button>
        </CardFooter>
      </Card>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <Card
            key={discussion.id}
            className={
              discussion.is_instructor_response ? "border-brand-primary" : ""
            }
          >
            <CardContent className="pt-6">
              {/* Discussion Header */}
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarImage
                    src={discussion.user.avatar_url}
                    alt={discussion.user.full_name}
                  />
                  <AvatarFallback>
                    {discussion.user.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {discussion.user.full_name}
                    </span>
                    {discussion.is_instructor_response && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs">
                        Instructor
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(discussion.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-2">{discussion.content}</p>
                </div>
              </div>

              {/* Discussion Actions */}
              <div className="flex items-center gap-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => toggleLike(discussion.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {discussion.likes > 0 && discussion.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setShowReplyForm({
                      ...showReplyForm,
                      [discussion.id]: true,
                    })
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  {discussion.replies.length > 0 && discussion.replies.length}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleReport(discussion.id)}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Reply Form */}
              {showReplyForm[discussion.id] && (
                <div className="mt-4 pl-12">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent[discussion.id] || ""}
                    onChange={(e) =>
                      setReplyContent({
                        ...replyContent,
                        [discussion.id]: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setShowReplyForm({
                          ...showReplyForm,
                          [discussion.id]: false,
                        })
                      }
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handlePostReply(discussion.id)}>
                      Reply
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="mt-4 pl-12 space-y-4">
                  {discussion.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-4 rounded-lg bg-muted ${
                        reply.is_instructor_response
                          ? "border-l-2 border-brand-primary"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={reply.user.avatar_url}
                            alt={reply.user.full_name}
                          />
                          <AvatarFallback>
                            {reply.user.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {reply.user.full_name}
                            </span>
                            {reply.is_instructor_response && (
                              <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs">
                                Instructor
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="mt-2">{reply.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                toggleLike(discussion.id, reply.id)
                              }
                            >
                              <ThumbsUp className="h-4 w-4" />
                              {reply.likes > 0 && reply.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() =>
                                handleReport(discussion.id, reply.id)
                              }
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
