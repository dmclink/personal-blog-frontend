import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function Register({ closeLoginMenu }) {
	const { user, login, error: loginError, register, sendVerificationEmail } = useAuth();

	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [emailSent, setEmailSent] = useState(user && user.verificationEmailLastSent);

	const handleVerificationSend = async (e) => {
		e.preventDefault();

		try {
			const resp = await sendVerificationEmail();
			console.log(resp);

			if (!resp.success) {
				const err = new Error(resp.data.error.message);
				throw err;
			}

			setEmailSent(new Date());
		} catch (err) {
			console.error(err);
			alert(err);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			if (password !== passwordConfirmation) {
				alert('password and confirmation do not match, try inputting both again');
				return;
			}

			const success = await register(username, email, password);
			if (!success) {
				// should be unreachable and should throw instead
				alert('something went wrong');
				return;
			}

			await handleVerificationSend(e);
		} catch (err) {
			console.error(err);
			alert(err);
		}
	};

	const verificationCooldown = emailSent && new Date() < new Date(Date.parse(emailSent) + 1000 * 60 * 15); // 15minutes after email sent
	console.log({ verificationCooldown });
	console.log(user);

	return (
		<section>
			{user && user.isLoggedIn() && user.canComment ? (
				<p>You're already verified! Go on and write some comments.</p>
			) : user && user.isLoggedIn() && !user.canComment ? (
				<>
					<p>You still need to verify your email.</p>
					<button disabled={verificationCooldown} onClick={handleVerificationSend} type="button">
						Send verification email
					</button>
				</>
			) : (
				<form className="login-form" onSubmit={handleSubmit}>
					<label>
						Username:{' '}
						<input type="text" name="username" required onChange={(e) => setUsername(e.target.value)} />
					</label>
					<label>
						Email: <input type="email" name="email" required onChange={(e) => setEmail(e.target.value)} />
					</label>
					<label>
						Password:{' '}
						<input
							type="password"
							minLength="8"
							name="current-password"
							required
							onChange={(e) => setPassword(e.target.value)}
						/>
					</label>
					<label>
						Confirm Password:{' '}
						<input
							type="password"
							name="confirm-password"
							minLength="8"
							required
							onChange={(e) => setPasswordConfirmation(e.target.value)}
						/>
					</label>
					{loginError && <p className="error-messaage">{loginError}</p>}
					<div className="login-buttons">
						<Link to="/home">Back to home</Link>
						<button type="submit">Register</button>
					</div>
				</form>
			)}
		</section>
	);
}

export default Register;
