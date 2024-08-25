'use client'
import { TextField, Box, Stack, Button, Typography, AppBar, Toolbar, Container, Grid } from "@mui/material"; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect } from 'react';

export default function Home() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the Rate My Professor support assistant. How can I help you today?"
    }
  ]);
  const [message, setMessage] = useState('');
  const chatContainRef = useRef(null);

  const sendMessage = async () => {
    if (message.trim() === '') 
      return;

    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' }
    ]);
    setMessage('');


    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  }

  useEffect(() => {
    if(chatContainRef.current) {
      chatContainRef.current.scrollTop = chatContainRef.current.scrollHeight;
    }
  }, [messages]);


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Check for Enter key, ignore Shift+Enter
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            AI Rate My Professor Chat
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* AI Explanation Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              About the AI
            </Typography>
            <Typography variant="body1" paragraph>
              This AI-powered customer service assistant is designed to help you with your inquiries about Rate My Professor. It uses advanced natural language processing to understand and respond to your queries in real-time.
            </Typography>
            <Typography variant="body1" paragraph>
              The AI is continuously learning and improving to provide more accurate and helpful responses. Feel free to ask it anything!
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
          <img
          src="https://blog.happyfox.com/wp-content/uploads/2020/10/How-AI-Chatbots-are-Transforming-Customer-Service.png"
          alt="AI Illustration"
          width={500}
          height={300}
          style={{ borderRadius: '8px' }}
            />
            <Typography variant="caption" display={'block'} textAlign="center">
              Illustration of AI in action.
            </Typography>
          </Grid>

          {/* Chat Section */}
          <Grid item xs={12}>
            <Box 
              width="100%" 
              height="500px" 
              display="flex" 
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Stack 
                direction="column" 
                width="100%"
                height="100%"
                border="1px solid black"
                p={2}
                spacing={3}
              >
                <Stack 
                  direction="column" 
                  spacing={2} 
                  flexGrow={1}
                  overflow='auto'
                  maxHeight='100%'
                  ref={chatContainRef}
                  >
                 {messages.map((message, index) => (
                      <Box 
                        key={index} 
                        display="flex" 
                        flexDirection="column" 
                        alignItems={message.role === "user" ? "flex-end" : "flex-start"}>
                        
                        {message.role === "user" && (
                          <Box display="flex" flexDirection="column" alignItems="flex-end">
                            <AccountCircleIcon fontSize="large"/> 
                            <Box 
                              bgcolor='secondary.main'
                              color="white"
                              borderRadius={16}
                              p={3}
                              mt={1}
                            >
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </Box>
                          </Box>
                        )}
                        
                        {message.role === "assistant" && (
                          <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
                            <SmartToyIcon fontSize="large"/>
                            <Box 
                              bgcolor='primary.main'
                              color="white"
                              borderRadius={16}
                              p={3}
                              mt={2}>
                              <Typography sx={{ml:2}}>
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                      
                    ))}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Message"
                    fullWidth
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h6" align="center" gutterBottom>
            AI Rate My Professor Chat
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
            By Brian, GEO, Fei Lin and Faizan.
          </Typography>
        </Container>
      </Box>
    </>
  );
}