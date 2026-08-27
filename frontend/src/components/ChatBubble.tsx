import clsx from "clsx";
import type { ChatMessage } from "../stores/chatStore";
import { WeatherCard } from "./WeatherCard";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("chat-bubble", isUser ? "chat-bubble--user" : "chat-bubble--assistant")}>
      <p>{message.text}</p>
      {message.response && <WeatherCard response={message.response} />}
    </div>
  );
}
