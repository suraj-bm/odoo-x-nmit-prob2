'use client';

import { useState, useEffect } from 'react';

export default function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {isLogin
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== LOGIN FORM =====================
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend sends serializer errors
        setError(data.non_field_errors ? data.non_field_errors[0] : 'Login failed');
      } else {
        localStorage.setItem('accessToken', data.tokens.access);
        localStorage.setItem('refreshToken', data.tokens.refresh);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-center text-2xl font-bold text-gray-900">Login</h2>

      <div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          maxLength={150}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Sign in
      </button>
    </form>
  );
}

// ===================== REGISTER FORM =====================
function RegisterForm() {
   const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'contact',
  phone: '',
  address: '',
});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/users/check-username/?username=${formData.username}`
        );
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      }
    };

    const delayDebounce = setTimeout(checkUsername, 500); // wait 0.5s after typing
    return () => clearTimeout(delayDebounce);
  }, [formData.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is already taken');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(JSON.stringify(data));
      } else {
        setSuccess('Registration successful! You can now log in.');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-center text-2xl font-bold text-gray-900">Register</h2>

      <div>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          maxLength={150}
          className="w-full px-3 py-2 border rounded-md"
        />
        {usernameAvailable === false && (
          <div className="text-red-600 text-sm mt-1">Username is already taken</div>
        )}
        {usernameAvailable === true && (
          <div className="text-green-600 text-sm mt-1">Username is available</div>
        )}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <select
  name="role"
  value={formData.role}
  onChange={handleChange}
  className="w-full px-3 py-2 border rounded-md"
>
  <option value="admin">Admin</option>
  <option value="invoicing_user">Invoicing User</option>
  <option value="contact">Customer</option>
</select>

      </div>
      <div>
  <input
    type="text"
    name="phone"
    placeholder="Phone Number"
    value={formData.phone}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 border rounded-md"
  />
</div>

<div>
  <input
    type="text"
    name="address"
    placeholder="Address"
    value={formData.address}
    onChange={handleChange}
    required
    className="w-full px-3 py-2 border rounded-md"
  />
</div>


      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      {success && <div className="text-green-600 text-sm text-center">{success}</div>}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Register
      </button>
    </form>
  );
}
