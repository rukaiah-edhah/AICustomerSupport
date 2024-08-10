import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { useState } from 'react';

function ChatSidebar({ selectedChat, setSelectedChat }) {
  // Example chat history - this will eventually be fetched from Supabase
  const chatHistory = [
    { role: 'user', message: 'Example Chat 1', created_at: new Date().toLocaleString() },
    { role: 'assistant', message: 'Example Chat 2', created_at: new Date().toLocaleString() },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{ width: 300, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 300 } }}
    >
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

export default ChatSidebar;