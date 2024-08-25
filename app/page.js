'use client';

import React from 'react';
import { TextField, Box, Stack, Button, Typography, AppBar, Toolbar, Container, Grid } from "@mui/material";
import { useRouter } from 'next/navigation';

export default function LandingPage() {

    const router = useRouter();

    const handleClick = () => {
        router.push('/content')
    }

    return (
        <>
        {/* Header */}
        <AppBar position="static">
            <Toolbar>
            <Typography variant="h6">
                AI Customer Service Chat
            </Typography>
            </Toolbar>
        </AppBar>
        {/* Main content */}
        <Container>
            <Grid container direction={'column'} justifyContent={'center'} alignContent={'center'}>
            <Grid item xs={12} md={6}>
                <Box p={3} m={20} textAlign={'center'}>
                <Typography variant="h4" gutterBottom>
                    Welcome to Rate My Professor!
                </Typography>
                <Typography variant="body1" paragraph>
                    Rate My Professor is a platform where students can rate and review their professors.
                </Typography>
                <Typography variant="body1" paragraph>
                    We use AI to analyze the reviews and provide insights to students.
                </Typography>
                <Typography variant="body1" paragraph>
                    Please sign in to get started.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleClick}>
                    Get Started
                </Button>
                </Box>
            </Grid>
            </Grid>
        </Container>
        </>
    );
}