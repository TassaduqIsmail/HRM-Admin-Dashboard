import React, { useState } from 'react';
import { Container, Box, Typography, Button, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import usePageTitle from '../../hooks/use-page-title';
import { InputField, PasswordField } from '../../components';
import apiManager from '../../services/api-manager';
import { setToast, setUser } from '../../store/reducer';

export default function profile() {
    usePageTitle('Profile');
    const { user } = useSelector(state => state.appReducer);
    const dispatch = useDispatch();
    const [formErr, setFormErr] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        password: user?.password || '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErr((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        let flag = false;
        if (formData?.name === '') {
            flag = true;
            setFormErr({ ...formErr, name: 'Name field is required' });
        }
        if (formData?.email === '') {
            flag = true;
            setFormErr({ ...formErr, email: 'Email field is required' });
        }
        return flag;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) return;
        setIsLoading(true);
        try {
            let { data } = await apiManager({ method: 'put', path: 'admin/update-profile', params: formData });
            dispatch(setUser(data?.response?.data));
            dispatch(setToast({ type: "success", message: data?.message }));
        } catch (error) {
            if (error?.response?.status === 422) {
                setFormErr(error?.response?.data?.response?.error);
            }
            if (error?.response?.status !== 422) {
                showMessage("error", error?.response?.data?.error?.message);
            }
        } finally {
            setIsLoading(false);
        };
    };

    return (
        <>
            <Container sx={{ pt: 2 }}>
                <Box variant='div' sx={{ my: 3 }}>
                    <Typography variant='h5' align='center'>Profile</Typography>
                </Box>
                <Box
                    component="form" autoComplete="off" autoCapitalize="off" onSubmit={handleSubmit}
                    sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                    <Box sx={{ minWidth: { sm: '400px', xs: '320px' }, mb: 2 }}>
                        <InputField
                            labelTop="Name"
                            size="large"
                            placeholder="Admin"
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            error={formErr?.name}
                            onChange={handleInputChange}
                        />
                    </Box>
                    <Box sx={{ minWidth: { sm: '400px', xs: '320px' }, mb: 2 }}>
                        <InputField
                            labelTop="Email"
                            size="large"
                            placeholder="Admin"
                            required
                            type="text"
                            name="email"
                            value={formData.email}
                            error={formErr?.email}
                            onChange={handleInputChange}
                        />
                    </Box>
                    <Box sx={{ minWidth: { sm: '400px', xs: '320px' }, mb: 2 }}>
                        <InputField
                            labelTop="Phone No"
                            size="large"
                            placeholder="123-456-789-0"
                            required
                            type="number"
                            name="phone_number"
                            value={formData?.phone_number}
                            error={formErr?.phone_number}
                            onChange={handleInputChange}
                        />
                    </Box>
                    <Box sx={{ minWidth: { sm: '400px', xs: '320px' }, mb: 2 }}>
                        <Box sx={{ minWidth: { sm: '400px', xs: '320px' }, mb: 2 }}>
                            <PasswordField
                                labelTop="Password"
                                size="large"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                error={formErr?.password}
                                onChange={handleInputChange}
                            />
                        </Box>
                    </Box>
                    <Button variant='contained' type='submit' sx={{ mt: 1 }}>{isLoading ? <CircularProgress size={20} /> : 'Update'}</Button>
                </Box>
            </Container>
        </>
    );
};