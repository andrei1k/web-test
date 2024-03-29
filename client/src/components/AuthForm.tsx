import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import '../styles/Auth.css';

interface AuthProps {
  onSubmit: (data: any, rememberMe: boolean) => void;
  formType: 'login' | 'register';
}

interface LocalData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

function AuthForm({ onSubmit, formType }: AuthProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrong, setPasswordStrong] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const isEmailValid = (email: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const isNameValid = (name: string): boolean => {
    return /^[а-яА-Яa-zA-Z-]+$/.test(name);
  };

  const isPasswordStrong = (password: string): boolean => {
    return /^(?=.*[a-zA-Z])(?=.*\d).{7,}$/.test(password);
  }

  const handlePasswordChange = 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentPassword = event.target.value;
      setPassword(currentPassword);
      setPasswordStrong(isPasswordStrong(currentPassword));
      setPasswordsMatch(currentPassword === confirmPassword);
      if (currentPassword === '' && confirmPassword === '') {
          setPasswordsMatch(true);
          setPasswordStrong(true);
      }
  };

  const handleConfirmPasswordChange = 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const currentPassword = event.target.value;
      setConfirmPassword(currentPassword);
      setPasswordsMatch(currentPassword === password);
  };

  const handleSubmit = 
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      if (!isEmailValid(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }

      if (formType === 'register') {
        if (!isNameValid(firstName) || !isNameValid(lastName)) {
          setMessage('Please enter valid first and last names.');
          return;
        }
      }

      const formData = { firstName, lastName, email, password };
      await fetch(`http://88.203.234.166:3001/auth/${formType}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)      
      })
      .then(response => {
          if (response.status === 400) {
              setMessage(`${formType === 'login' ? 
                'Wrong email or password!' : 
                'Email is already used!'} `
              );
              throw new Error('Bad request');
          }
          if (!response.ok) {
              throw new Error('Server response was not ok');
          }
          return response.json();
      })
      .then(data => {
          setMessage(`${formType === 'login' ? 'Login' : 'Register'} successfully!`);
          let localData: LocalData;
          // If we register now, we gat the form data.
          if (formType === 'login') {
            localData = {
              firstName: data.firstName, 
              lastName: data.lastName, 
              email: data.email 
            }
          } else {
            localData = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email
            }
          }
          setSuccess(true);
          onSubmit(localData, rememberMe);
      })
      .catch(error => {
          console.error(`${formType} error:`, error);
    });
  };

  return (
    <div className='auth-container'>
      <form className='auth-form' onSubmit={handleSubmit} noValidate>
        <h2>{formType === 'login' ? 'Login' : 'Register'}</h2>          
        <div className='input-group'>
          {formType === 'register' && (
            <>
              <input type='text' name='first-name' placeholder='First name' 
                required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input type='text' name='last-name' placeholder='Last name' 
                required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </>
          )}
          <input type='email' name='email' placeholder='Email address' 
            required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type='password' name='password' placeholder='Password' 
            required value={password} onChange={handlePasswordChange} />
          {formType === 'register' && (
            <>
              <input type='password' name='confirm-password' placeholder='Confirm password' 
                required value={confirmPassword} onChange={handleConfirmPasswordChange} />
              {!passwordsMatch && <p>Passwords do not match!</p>}
              {!passwordStrong && <p>Password must have at least 8 symbols, char and digits!</p>}
            </>
          )}
        </div>
        {formType === 'login' && 
          <label className='remember-button'>
            <input type='checkbox' onChange={() => setRememberMe(!rememberMe)} checked={rememberMe}/>Remember Me
          </label>
        }
        <button className='submit' type='submit'>{formType === 'login' ? 'Login' : 'Register'}</button>
        {success && <Navigate to='/dashboard'/>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default AuthForm;
