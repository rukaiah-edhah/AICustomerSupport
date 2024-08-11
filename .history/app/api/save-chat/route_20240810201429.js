// Example for `/api/save-chat` endpoint
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chat } from '@/db/schema/chat';

export async function POST(req) {
  try {
    const data = await req.json();

    // Save the chat with unique ID
    await db.insert(chat).values({
      id: data.id,
      user_id: data.user_id,
      role: 'user',
      content: data.messages.map(msg => msg.content).join('\n'),
      createdAt: data.createdAt
    });

    return new NextResponse('Chat saved successfully', { status: 200 });
  } catch (error) {
    console.error('Error saving chat:', error);
    return new NextResponse('An error occurred while saving the chat', { status: 500 });
  }
}
