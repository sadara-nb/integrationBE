import { NextRequest, NextResponse } from "next/server";
import { MOCK_POSTS, CURRENT_USER } from "@/lib/mock-data";
import { CreatePostPayload } from "@/lib/types";

export async function GET() {
  return NextResponse.json(MOCK_POSTS);
}

export async function POST(req: NextRequest) {
  const body: CreatePostPayload = await req.json();

  if (!body.imageUrl || !body.caption) {
    return NextResponse.json(
      { error: "imageUrl and caption are required" },
      { status: 400 }
    );
  }

  const newPost = {
    id: `post_${Date.now()}`,
    author: CURRENT_USER,
    imageUrl: body.imageUrl,
    caption: body.caption,
    location: body.location,
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    comments: [],
    isLiked: false,
    isSaved: false,
  };

  MOCK_POSTS.unshift(newPost);

  return NextResponse.json(newPost, { status: 201 });
}