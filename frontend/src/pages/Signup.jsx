import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Rocket, Shield } from 'lucide-react';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(username, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

  return (
    <div className="auth-container">
        <div className="auth-left">
            <div className="auth-logo">
                <BookOpen size={40} strokeWidth={2} />
                Mockingbird
            </div>
            <div className="auth-tagline">Your daily notes companion</div>
            <div className="auth-features">
                <div className="feature">
                    <span className="feature-icon"><Rocket size={20} /></span>
                    <span>Get started in seconds</span>
                </div>
                <div className="feature">
                    <span className="feature-icon"><Shield size={20} /></span>
                    <span>Secure & private notes</span>
                </div>
            </div>
        </div>

        <div className="auth-right">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p>Start organizing your notes today</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        required
                    />
                    <button type="submit" className="auth-button">Sign Up</button>
                </form>
                
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    </div>
);
};

export default Signup;