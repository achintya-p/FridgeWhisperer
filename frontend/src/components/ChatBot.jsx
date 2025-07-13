import React, { useState, useRef, useEffect } from 'react';

const Message = ({ content, isUser }) => (
  <div
    className={`
      flex w-full mb-4
      ${isUser ? 'justify-end' : 'justify-start'}
    `}
  >
    <div
      className={`
        max-w-[80%] rounded-lg px-4 py-2
        ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}
      `}
    >
      {content}
    </div>
  </div>
);

const ChatBot = ({ onSendMessage, ingredients }) => {
  const [messages, setMessages] = useState([
    {
      content: "Hi! I'm your cooking assistant. Ask me anything about cooking with your ingredients!",
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage);
      setMessages(prev => [...prev, { content: response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          content: "Sorry, I'm having trouble responding right now. Please try again.",
          isUser: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cooking with your ingredients..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`
              px-6 py-2 rounded-lg font-medium
              ${isLoading || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'}
            `}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot; 