'use client'

import { AppBar, Toolbar, Typography, Box, Button, Stack, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import LoginIcon from '@mui/icons-material/Login'; 

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
  const [chatHistories, setChatHistories] = useState([]) // State for chat histories
  const [selectedChatId, setSelectedChatId] = useState(null) // State for selected chat history

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch chat histories from the backend when the component mounts
    const fetchChatHistories = async () => {
      try {
        const response = await fetch('/api/chat/histories')
        const data = await response.json()
        setChatHistories(data)
      } catch (error) {
        console.error('Error fetching chat histories:', error)
      }
    }

    fetchChatHistories()
  }, [])

  const handleSelectChat = async (chatId) => {
    setSelectedChatId(chatId)
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      const chatHistory = await response.json()
      setMessages(chatHistory.messages)
      setChatStarted(true) // Mark chat as started
    } catch (error) {
      console.error('Error fetching chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

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
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="center"
      bgcolor="white"
    >
      <AppBar position="static" color="default" elevation={0} style={{ backgroundColor: 'white', padding: '10px 20px' }}>
        <Toolbar style={{ backgroundColor: 'white', color: 'black', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">
          </Typography>
          <Button color="inherit" endIcon={<LoginIcon />}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Radio button interface for selecting chat history */}
      <Box width="60%" mt={2}>
        <RadioGroup
          aria-label="chat history"
          name="chat-history"
          value={selectedChatId}
          onChange={(e) => handleSelectChat(e.target.value)}
        >
          {chatHistories.map((history) => (
            <FormControlLabel
              key={history.id}
              value={history.id}
              control={<Radio />}
              label={`Chat with ${history.partner}`}
            />
          ))}
        </RadioGroup>
      </Box>

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
  )
}
