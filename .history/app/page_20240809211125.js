'use client'

import { AppBar, Toolbar, Typography, Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login'; 
import ChatSidebar from '@/components/ChatSidebar';
const { BufferMemory } = require('langchain/memory');

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "I am your AI-powered job application assistant. How can I help you achieve your career goals today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatStarted, setChatStarted] = useState(false) 
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize BufferMemory to store chat history
  const memory = new BufferMemory({ returnMessages: true, memoryKey: "chat_history" });

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = () => {
    // Attempt to retrieve messages from BufferMemory
    const storedMessages = memory.memory[memory.memoryKey] || []; // Adjust based on actual method of access
    setMessages(storedMessages);
  }

  useEffect(() => {
    loadChatHistory(); // Load chat history on component mount
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    // Mark chat as started
    if (!chatStarted) {
      setChatStarted(true)
    }
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }

      // Store updated messages in BufferMemory
      memory.memory[memory.memoryKey] = [...messages, { role: 'user', content: message }]; // Adjust based on actual method of access

    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage()
    }
  }

  // Sample chat history to demonstrate switching between chats
  const chatHistory = [
    [
      { role: 'user', content: 'Example Chat 1 - Message 1' },
      { role: 'assistant', content: 'Example Chat 1 - Message 2' },
    ],
    [
      { role: 'user', content: 'Example Chat 2 - Message 1' },
      { role: 'assistant', content: 'Example Chat 2 - Message 2' },
    ]
  ];

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
            <Typography variant="h6">
            </Typography>
            <Button color="inherit" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </Button>
            <Button color="inherit" endIcon={<LoginIcon />}>
              Login
            </Button>
          </Toolbar>
        </AppBar>

        {selectedChat === null ? (
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
              <Button variant="outlined" style={{ borderColor: 'black', color: 'black', padding: '10px 20px' }}>
                sample question 1 
              </Button>
              <Button variant="outlined" style={{ borderColor: 'black', color: 'black', padding: '10px 20px' }}>
                sample question 2
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack
            direction={'column'}
            spacing={2}
            width="60%"
            maxHeight="60vh"
            overflow="auto"
            flexGrow={1} 
            mb={2} 
          >
            {chatHistory[selectedChat].map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'white' 
                      : 'lightgrey' 
                  }
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
            onClick={sendMessage}
            disabled={isLoading}
            style={{ backgroundColor: 'black', color: 'white' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
