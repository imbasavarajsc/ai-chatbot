
import { useState, useLayoutEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesContainerRef = useRef(null);

  // Keep the chat at the bottom when messages or streamed text change.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    const userMessage = prompt.trim();

    if (!userMessage || loading) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ];

    setMessages([
      ...updatedMessages,
      {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      },
    ]);

    setPrompt("");
    setLoading(true);
    setCopiedIndex(null);

    try {
      const response = await fetch("https://ai-chatbot-qg2t.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to get a response.");
      }

      if (!response.body) {
        throw new Error("The server returned an empty response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantReply = "";
      let buffer = "";
      let streamFinished = false;

      while (!streamFinished) {
        const { value, done } = await reader.read();

        buffer += decoder.decode(value || new Uint8Array(), {
          stream: !done,
        });

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";

        for (const eventText of events) {
          const dataLine = eventText
            .split(/\r?\n/)
            .find((line) => line.startsWith("data:"));

          if (!dataLine) continue;

          const data = dataLine.slice(5).trim();

          if (data === "[DONE]") {
            streamFinished = true;
            break;
          }

          let parsedData;

          try {
            parsedData = JSON.parse(data);
          } catch {
            continue;
          }

          if (
            parsedData &&
            typeof parsedData === "object" &&
            parsedData.error
          ) {
            throw new Error(parsedData.error);
          }

          if (typeof parsedData !== "string") continue;

          assistantReply += parsedData;

          setMessages((currentMessages) => {
            const updated = [...currentMessages];
            const lastIndex = updated.length - 1;

            if (updated[lastIndex]?.role === "assistant") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: assistantReply,
              };
            }

            return updated;
          });
        }

        if (done) break;
      }

      if (!assistantReply) {
        throw new Error("The AI returned an empty response. Please try again.");
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((currentMessages) => {
        const updated = [...currentMessages];
        const lastIndex = updated.length - 1;

        if (updated[lastIndex]?.role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: `Sorry, something went wrong: ${error.message}`,
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    if (messages.length === 0) return;

    if (window.confirm("Are you sure you want to start a new chat?")) {
      setMessages([]);
      setPrompt("");
      setCopiedIndex(null);
    }
  };

  const copyResponse = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
    } catch {
      alert("Could not copy the response. Please try again.");
    }
  };

  return (
    <div className="app">
      <header className="chat-header">
        <h1>AI Chatbot</h1>

        <button
          type="button"
          className="new-chat-button"
          onClick={startNewChat}
        >
          + New Chat
        </button>
      </header>

      <main className="chat-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>How can I help you today?</h2>
            <p>Ask me anything to get started.</p>
          </div>
        )}

        <div className="messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div
              className={`message ${message.role}`}
              key={`${index}-${message.role}`}
            >
              <div className="message-content">
                {message.role === "assistant" ? (
                  message.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : loading && index === messages.length - 1 ? (
                    <span className="loading-dots">Thinking...</span>
                  ) : null
                ) : (
                  message.content
                )}
              </div>

              {message.timestamp && (
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}

              {message.role === "assistant" && message.content && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => copyResponse(message.content, index)}
                >
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <form className="chat-input-area" onSubmit={sendMessage}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Type your message..."
          rows={1}
          disabled={loading}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage(event);
            }
          }}
        />

        <button type="submit" disabled={loading || !prompt.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default App;
