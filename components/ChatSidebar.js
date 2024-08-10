'use client'

import { Box, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function ChatSidebar({ selectedChat, setSelectedChat }) {
  // Example chat history - this will eventually be fetched from the database
  const chatHistory = [
    { role: 'user', message: 'Example Chat 1', created_at: new Date().toLocaleString() },
    { role: 'assistant', message: 'Example Chat 2', created_at: new Date().toLocaleString() },
  ];

  const { user, getUser } = useKindeBrowserClient();
  const alsoUser = getUser();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{ width: 300, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 300 } }}
    >
      {user ? (
        <Box
          display='flex'
          flexDirection="row"
          alignItems='center'
          justifyContent='start'
          margin={2}
        >
          <Typography variant="h6">Welcome, {alsoUser.given_name}!</Typography>
        </Box>
      ) : null}
      <List>
        {chatHistory.map((chat, index) => (
          <ListItem
            button
            key={index}
            onClick={() => setSelectedChat(index)}
            selected={selectedChat === index}
          >
            <ListItemText
              primary={`${chat.role}: ${chat.message}`}
              secondary={chat.created_at}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
