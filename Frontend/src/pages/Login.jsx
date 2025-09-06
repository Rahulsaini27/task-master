import { useContext, useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Check, ChevronLeft, Github, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';

// Input Field Component
const InputField = ({ icon, type, placeholder, value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className={`bg-white rounded-lg border transition-all duration-200 mb-4 relative ${focused ? 'border-purple-500 shadow-md' : 'border-gray-300'
        }`}
    >
      <div className="flex items-center px-4 py-3">
        <div className={`mr-3 text-gray-400 ${focused ? 'text-purple-500' : ''}`}>
          {icon}
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-grow outline-none text-gray-700"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="text-gray-400 hover:text-gray-600 ml-2 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

// Social Login Button Component
const SocialButton = ({ icon, provider, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center bg-white border border-gray-300 rounded-lg py-3 px-4 w-full hover:bg-gray-50 transition-colors duration-200"
    >
      {icon}
      <span className="ml-2 text-gray-700 font-medium">Continue with {provider}</span>
    </button>
  );
};

// Alert Component
const Alert = ({ type, message }) => {
  if (!message) return null;

  const alertStyles = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700"
  };

  const iconColor = type === "error" ? "text-red-500" : "text-green-500";

  return (
    <div className={`${alertStyles[type]} px-4 py-3 rounded relative mb-4 flex items-start`}>
      <div className={`mr-2 mt-0.5 ${iconColor}`}>
        {type === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
      </div>
      <span>{message}</span>
    </div>
  );
};

// Login Form Component
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const { API_BASE_URL } = useContext(AppContext);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsLoading(true);
    setAlert({ type: "", message: "" });

    try {
      // Using fetch instead of axios
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      console.log(data)
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.id)
      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);

        // If remember me is checked, save user credentials
        if (formData.rememberMe) {
          localStorage.setItem('userEmail', formData.email);
        } else {
          localStorage.removeItem('userEmail');
        }

        setAlert({ type: "success", message: "Login successful! Redirecting..." });
        navigate("/layout/dashboard")
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlert({
        type: "error",
        message: error.message || "Login failed. Please check your credentials and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Alert type={alert.type} message={alert.message} />

      <InputField
        icon={<Mail size={18} />}
        type="email"
        placeholder="Email Address"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <InputField
        icon={<Lock size={18} />}
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <div className="flex items-center justify-between mt-6 mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>

        <a className="text-sm text-purple-600 hover:text-purple-800 transition-colors cursor-pointer">
          Forgot password?
        </a>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="mr-2">
          {isLoading ? "Logging in..." : "Log In"}
        </span>
        {!isLoading && <ArrowRight size={18} />}
      </button>
    </div>
  );
};

// Main Component
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with back button */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to={"/"}>
          <div className="flex items-center text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
            <ChevronLeft size={20} className="mr-2" />
            <span>Back to home</span>
          </div>
          </Link>
          
          <div className="ml-auto flex items-center space-x-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg">
              <Check size={20} />
            </div>
            <span className="text-xl font-bold text-gray-800">TaskMaster</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left side - Auth form */}
        <div className="w-full md:w-1/2 px-6 py-8 md:px-12 md:py-12 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-gray-600">
                Sign in to your account to continue
              </p>
            </div>

            <div className="mt-8">
              <div className="mt-6">
                <LoginForm />
                <div className="mt-6 text-center text-sm text-gray-500">
                <p>
                  <span className="font-semibold">Admin:</span> superadmin@gmail.com | <span className="font-semibold">Password:</span> superadmin@gmail.com
                </p>
              </div>
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-50 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <SocialButton
                    icon={<Mail size={18} className="text-red-500" />}
                    provider="Email"
                    onClick={() => console.log('Email login')}
                  />
                  <SocialButton
                    icon={<Github size={18} className="text-gray-800" />}
                    provider="GitHub"
                    onClick={() => console.log('GitHub login')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Decorative panel */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-900 to-indigo-800 text-white relative">
          <div className="absolute inset-0 flex items-center justify-center px-12">
            <div className="max-w-lg">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-6">
                  Manage Tasks <span className="text-purple-300">Effortlessly</span>
                </h2>
                <p className="text-xl mb-8 text-purple-100">
                  TaskMaster helps you organize, prioritize, and complete tasks seamlessly across all your projects.
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>

                {/* Task card mockups */}
                <div className="mt-8 space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left border-l-4 border-purple-400 shadow-lg">
                    <h3 className="font-medium">Complete project proposal</h3>
                    <div className="text-sm text-purple-200 mt-1">Due: May 10, 2025</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left border-l-4 border-blue-400 shadow-lg">
                    <h3 className="font-medium">Review design mockups</h3>
                    <div className="text-sm text-purple-200 mt-1">Due: May 5, 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
