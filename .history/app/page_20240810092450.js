"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  IconButton,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import LoginIcon from "@mui/icons-material/Login";
import ChatSidebar from "@/components/ChatSidebar";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import MenuIcon from "@mui/icons-material/Menu";
import { eq } from "drizzle-orm/expressions";
import { db } from "./path_to_your_db_config";
import { chat } from "@/db/schema/chat.js";


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I am your AI-powered job application assistant. How can I help you achieve your career goals today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const user = useKindeBrowserClient().user;

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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      bgcolor="white"
    >
      {isSidebarOpen && (
        <ChatSidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
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
        {!chatStarted && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            flexGrow={1}
          >
            <Typography variant="h4" color="black">
              I am your AI-powered job application assistant.
            </Typography>
            <Typography variant="h6" color="black" mt={2}>
              How can I help you achieve your career goals today?
            </Typography>

            <Stack direction={'row'} spacing={2} mt={4}>
              <Button
                variant="outlined"
                style={{ borderColor: 'black', color: 'black', padding: '10px 20px' }}
                onClick={() => sendMessage('how to prepare for an SWE technical interview')}
              >
                how to prepare for an SWE technical interview
              </Button>
              <Button
                variant="outlined"
                style={{ borderColor: 'black', color: 'black', padding: '10px 20px' }}
                onClick={() => sendMessage('how to write a good resume for a data science role')}
              >
                how to write a good resume for a data science role
              </Button>
            </Stack>
          </Box>
        )}
        {chatStarted && (
          <Stack
            direction={'column'}
            spacing={2}
            width="60%"
            maxHeight="60vh"
            overflow="auto"
            flexGrow={1}
            mb={2}
          >
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
        )}
        <Stack
          direction={'row'}
          spacing={2}
          width="60%"
          mb={4}
          position="fixed"
          bottom={16}
        >
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
  );
}