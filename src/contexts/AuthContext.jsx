import { jwtDecode } from 'jwt-decode';
import { createContext, useState, useContext, useEffect } from 'react';
import usePost from '../hooks/usePost.js';

import axios from '../config/axios.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);

	const { postData: postLogin, error: loginError } = usePost('/auth/login');
	const { postData: postRegister, error: registerError } = usePost('/auth/register');

	const login = async (username, password) => {
		try {
			const result = await postLogin({ username, password });
			const respToken = result && result.token;
			const respData = jwtDecode(respToken);

			setUser({
				username,
				expiration: respData.exp,
				canPost: respData.can_post,
				canComment: respData.email_verified,
				admin: respData.admin,
				verificationEmailLastSent: respData.email_sent_at,
				isLoggedIn: () => {
					return new Date() < new Date(Number(respData.exp) * 1000);
				},
			});
			setError(null);

			axios.defaults.headers.common['Authorization'] = respToken;

			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	};

	const register = async (username, email, password) => {
		try {
			const result = await postRegister({ username, email, password });
			const respToken = result && result.token;
			const respData = jwtDecode(respToken);

			setUser({
				username,
				expiration: respData.exp,
				canPost: respData.can_post,
				canComment: respData.email_verified,
				admin: respData.admin,
				verificationEmailLastSent: respData.email_sent_at,
				isLoggedIn: () => {
					return new Date() < new Date(Number(respData.exp) * 1000);
				},
			});
			setError(null);

			axios.defaults.headers.common['Authorization'] = respToken;

			return true;
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	const sendVerificationEmail = async () => {
		try {
			if (!user.isLoggedIn()) {
				throw new Error('user not logged in');
			}
			if (user.canComment) {
				throw new Error('user is already verified');
			}

			const resp = await axios.get('/auth/verify-email');

			return resp;
		} catch (err) {
			console.error(err);
			throw err;
		}
	};

	const logout = () => {
		setError(null);
		setUser(null);
		delete axios.defaults.headers.common['Authorization'];
	};

	return (
		<AuthContext.Provider value={{ user, error, login, logout, register, sendVerificationEmail }}>
			{children}
		</AuthContext.Provider>
	);
}

function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an Auth Provider');
	}

	return context;
}

export { AuthProvider, useAuth };
