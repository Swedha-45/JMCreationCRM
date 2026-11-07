import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'director' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        alert('Account created! Please login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h1>
        
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={20} />
              <input type="text" required className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-white"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input type="email" required className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-white"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input type="password" required className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-white"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-3 rounded-lg font-semibold mt-4">
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;