import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Lock, Mail } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

   return (
    <div className="auth-container">
        <div className="auth-left">
            <div className="auth-logo">
                <BookOpen size={40} strokeWidth={2} />
                Mockingbird
            </div>
            <div className="auth-tagline">Organize your thoughts, brilliantly.</div>
            <div className="auth-features">
                <div className="feature">
                    <span className="feature-icon"><BookOpen size={20} /></span>
                    <span>Hierarchical folder structure</span>
                </div>
                <div className="feature">
                    <span className="feature-icon"><Lock size={20} /></span>
                    <span>Secure & private notes</span>
                </div>
            </div>
        </div>

        <div className="auth-right">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p>Login to continue to your workspace</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
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
                    <button type="submit" className="auth-button">Login</button>
                </form>
                
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    </div>
);
};

export default Login;