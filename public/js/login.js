/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (userEmail, userPassword) => {
    try {
        const res = await axios.post('/api/v1/users/login', {
            userEmail,
            userPassword,
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Welcome Back!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if (res.data.status === 'success') location.reload(true);
    } catch (err) {
        console.log(err);
        showAlert('error', 'Something went wrong!');
    }
};
