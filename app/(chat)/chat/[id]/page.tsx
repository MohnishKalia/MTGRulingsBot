import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ResolvingMetadata, Metadata } from 'next';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

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
    (m: any) => m.role === 'user' && typeof m.content === 'string'
  );
  const firstAssistantMessage = [...messages]
    .reverse()
    .find(
      (m: any) =>
        m.role === 'assistant' &&
        Array.isArray(m.content) &&
        m.content.some(
          (c: any) => c.type === 'text'
        )
    );

  const title = chat.title || 'User Chat';

  let description = 'A chat with Rules Bot';

  if (firstAssistantMessage && 
      Array.isArray(firstAssistantMessage.content) &&
      firstAssistantMessage.content.length > 0 &&
      firstAssistantMessage.content[0].type === 'text' &&
      typeof firstAssistantMessage.content[0].text === 'string'
    ) {
    description = firstAssistantMessage.content[0].text;
  }

  if (firstUserMessage && typeof firstUserMessage.content === 'string') {
    description = firstUserMessage.content;
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

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
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
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
