import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../store/authStore';
import './AuthPage.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [submitError, setSubmitError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitError(null);
    const result = await login(data);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">🌿</div>
          <span>Wanderlist</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to your account.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...formRegister('email')}
              className={errors.email ? 'input-error' : ''}
              autoFocus
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              {...formRegister('password')}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          {submitError && <div className="form-error">{submitError}</div>}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log in →'}
          </button>
        </form>

        <p className="auth-footer">
          New to Wanderlist?{' '}
          <Link to="/signup" className="auth-link">Create an account</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-quote-mark">"</div>
          <p className="auth-quote">
            Found a hidden beach in Amalfi I'd never have found on my own. Worth every dollar.
          </p>
          <div className="auth-quote-author">
            <div className="auth-quote-avatar">M</div>
            <div>
              <div className="auth-quote-name">Marco R.</div>
              <div className="auth-quote-role">Bought Italy plan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}