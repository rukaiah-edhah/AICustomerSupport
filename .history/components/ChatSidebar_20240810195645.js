'use client'

import { Box, Button, Divider, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function ChatSidebar({ selectedChat, setSelectedChat, chatHistory, onNewChat }) {
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
          justifyContent='center'
          p={2}
          bgcolor='lightgrey'
        >
          <Typography variant="h6">Welcome, {user.name || 'User'}!</Typography>
        </Box>
      ) : (
        <Box
          display='flex'
          flexDirection="row"
          alignItems='center'
          justifyContent='center'
          p={2}
          bgcolor='lightgrey'
        >
          <Typography variant="h6">Please log in to see your chats.</Typography>
        </Box>
      )}
      <Divider />
      <List>
        {chatHistory.map((chat, index) => (
          <ListItem button key={index} onClick={() => setSelectedChat(chat)}>
            <ListItemText primary={`Chat ${index + 1}`} secondary={chat.createdAt} />
          </ListItem>
        ))}
      </List>
      <Box p={2} textAlign='center'>
        <Button variant
