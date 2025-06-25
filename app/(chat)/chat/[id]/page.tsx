import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ResolvingMetadata, Metadata } from 'next';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const MAX_DESCRIPTION_LENGTH = 130;

  const id = (await params).id || '';
  // Parallelize fetching chat and messages
  const [chat, messages] = await Promise.all([
    getChatById({ id }),
    getMessagesByChatId({ id })
  ]);
  if (!chat) {
    return {};
  }

  const firstUserMessage = messages.find(
    m => m.role === 'user' && Array.isArray(m.parts) && m.parts.length > 0 && typeof m.parts[0].text === 'string'
  );
  const firstAssistantMessage = [...messages]
    .reverse()
    .find(
      m =>
        m.role === 'assistant' &&
        Array.isArray(m.parts) &&
        m.parts.some((c: any) => c.type === 'text')
    );

  const title = chat.title || 'User Chat';

  let description = 'A chat with Rules Bot';

  if (
    firstAssistantMessage &&
    Array.isArray(firstAssistantMessage.parts) &&
    firstAssistantMessage.parts.length > 0 &&
    firstAssistantMessage.parts[0].type === 'text' &&
    typeof firstAssistantMessage.parts[0].text === 'string'
  ) {
    description = firstAssistantMessage.parts[0].text;
  }

  if (
    firstUserMessage &&
    Array.isArray(firstUserMessage.parts) &&
    firstUserMessage.parts.length > 0 &&
    typeof firstUserMessage.parts[0].text === 'string'
  ) {
    description = firstUserMessage.parts[0].text;
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = `${description.substring(0, MAX_DESCRIPTION_LENGTH)}...`;
  }
  
  return {
    title: `rules.fyi - ${title}`,
    description: description
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  if (chat.visibility === 'private') {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          session={session}
          autoResume={true}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
        session={session}
        autoResume={true}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
