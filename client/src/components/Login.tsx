import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/Auth.css';

interface LoginProps {
    onLogin: (localData: LocalData, rememberMe: boolean) => void;
}

interface LocalData {
    firstName: string;
    lastName: string;
    email: string;
}

function Login({ onLogin }: LoginProps) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [successLogin, setSuccessLogin] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await fetch('http://88.203.234.166:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            const localData:LocalData = {firstName: data.firstName, lastName: data.lastName, email:data.email};
            setSuccessLogin(true);
            onLogin(localData, rememberMe);     
        })
        .catch(error => {
            setMessage('Wrong email or password!');
            console.error('Logging error:', error);
        });
    };

    return (
        <div className='auth-container'>
            <form className='auth-form' onSubmit={handleSubmit}>
            
                <h2>Login</h2>
                <div className='input-group'>
                    <input type='email' id='email' name='email' placeholder='Email address' 
                        onChange={(e) => setEmail(e.target.value)} required/>
                    <input type='password' id='password' name='password' placeholder='Password' 
                        onChange={(e) => setPassword(e.target.value)} required/>
                </div>
                <label className='remember-button'>
                    <input type='checkbox' onChange={handleRememberMe} checked={rememberMe}/>Remember Me
                </label>
                <button type='submit'>Login</button>
                {successLogin && <Navigate to='/dashboard'/>}
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default Login;
