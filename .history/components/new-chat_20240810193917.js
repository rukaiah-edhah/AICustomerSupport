'use client'

import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

export default function NewChat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text) => {
    // Your existing sendMessage logic here
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
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="white"
    >
      <Typography variant="h4" color="black">
        Start a New Chat
      </Typography>
      <Stack
        direction={'column'}
        spacing={2}
        width="60%"
        maxHeight="60vh"
        overflow="auto"
        flexGrow={1}
        mb={2}
        mt={2}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
          >
            <Box
              bgcolor={msg.role === 'assistant' ? 'white' : 'lightgrey'}
              color="black"
              borderRadius={16}
              p={2}
            >
              {msg.content}
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack
        direction={'row'}
        spacing={2}
        width="60%"
        mb={4}
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
  );
}
