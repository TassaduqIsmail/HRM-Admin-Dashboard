import React from 'react';
import { Button, Container, Typography } from '@mui/material';

function NotFound() {
    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: 4,
            }}
        >
            <Typography
                variant="h4"
                sx={{ marginBottom: 2 }}
            >
                404 - Not Found
            </Typography>
            <Typography
                variant="body1"
                sx={{ marginBottom: 2 }}
            >
                Sorry, the page you are looking for does not exist.
            </Typography>

            <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ marginBottom: 2 }}
            >
                Back to home
            </Button>
        </Container>
    );
}

export default NotFound;