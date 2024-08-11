'use client'

import { AppBar, Box, Button, Divider, IconButton, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import ChatSidebar from '@/components/ChatSidebar';
import { LoginLink, LogoutLink } from '@kinde-oss/kinde-auth-nextjs';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import MenuIcon from '@mui/icons-material/Menu';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatNumber, setCurrentChatNumber] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const { user, getUser } = useKindeBrowserClient();
  const alsoUser = getUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    const currentMessage = text || message;
    if (!currentMessage.trim() || isLoading) return;
    setIsLoading(true);

    if (!chatStarted) {
      setChatStarted(true);
    }

    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: currentMessage },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: currentMessage }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    // Save current chat to history
    if (chatStarted) {
      const chatId = uuidv4(); // Generate a unique ID for the new chat
      const newChatHistory = {
        id: chatId,
        messages: messages,
        createdAt: new Date().toLocaleString()
      };

      setChatHistory((prevHistory) => [
        ...prevHistory,
        newChatHistory
      ]);

      // Optionally save to backend
      await fetch('/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChatHistory),
      });

      // Update current chat number
      setCurrentChatNumber(chatHistory.length + 1);
    }

    // Clear current chat
    setMessages([]);
    setChatStarted(false);
    setSelectedChatId(null);
    setSelectedChat(null);
  };

  const setSelectedChat = (chat) => {
    setMessages(chat.messages);
    setChatStarted(true);
    setSelectedChatId(chat.id);
    setCurrentChatNumber(chatHistory.findIndex(c => c.id === chat.id) + 1);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      bgcolor="white"
    >
      {isSidebarOpen && (
        <ChatSidebar
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          chatHistory={chatHistory}
          onNewChat={startNewChat}
        />
      )}

      <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center">
        <AppBar position="static" color="default" elevation={0} style={{ backgroundColor: 'white', padding: '10px 20px' }}>
          <Toolbar style={{ backgroundColor: 'white', color: 'black', display: 'flex', justifyContent: 'space-between' }}>
            <IconButton edge="start" color="inherit" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6"></Typography>
            {user ? (
              <LogoutLink style={{ color: 'black' }}>
                <Button color="inherit" endIcon={<LoginIcon />}>
                  Logout
                </Button>
              </LogoutLink>
            ) : (
              <LoginLink style={{ color: 'black' }}>
                <Button color="inherit" endIcon={<LoginIcon />}>
                  Login
                </Button>
              </LoginLink>
            )}
          </Toolbar>
        </AppBar>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          flexGrow={1}
        >
          {chatStarted && (
            <Typography variant="h6" color="black" mb={2}>
              Current Chat: {currentChatNumber}
            </Typography>
          )}
          <Stack direction={'column'} spacing={2} width="60%" maxHeight="60vh" overflow="auto" flexGrow={1} mb={2}>
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? 'white' : 'lightgrey'}
                  color="black"
                  borderRadius={16}
                  p={2}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2} width="60%" mb={4} position="fixed" bottom={16}>
            <TextField
              label="Send a message."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={() => sendMessage()}
              disabled={isLoading}
              style={{ backgroundColor: 'black', color: 'white' }}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
