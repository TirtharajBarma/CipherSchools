import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiMail, FiLock, FiEye, FiEyeOff, FiCode, FiZap, FiSave } from 'react-icons/fi'
import { loginUser, clearError } from '../store/slices/authSlice'
import DemoModeButton from './DemoModeButton'

const LoginPage = ({ onSwitchToSignup }) => {
    const dispatch = useDispatch()
    const { loading, error } = useSelector(state => state.auth)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (error) {
            dispatch(clearError())
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.email || !formData.password) {
            return
        }

        try {
            await dispatch(loginUser({
                email: formData.email,
                password: formData.password
            })).unwrap()
        } catch (err) {
            // If server is down, allow demo mode
            if (err && (err.includes('ERR_CONNECTION_TIMED_OUT') || err.includes('Failed to fetch') || err.includes('NetworkError'))) {
                console.warn('Server unavailable, using demo mode')
                const demoUser = {
                    id: 'demo-' + Date.now(),
                    username: formData.email.split('@')[0] || 'demo',
                    email: formData.email
                }
                localStorage.setItem('user', JSON.stringify(demoUser))
                localStorage.setItem('authToken', 'demo-token-' + Date.now())
                window.location.reload()
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <FiCode className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to continue to CipherStudio
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-11 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    New to CipherStudio?
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <button
                        onClick={onSwitchToSignup}
                        className="w-full text-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                    >
                        Create your account
                    </button>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
                            <FiCode className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Live Coding</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
                            <FiZap className="text-purple-600 dark:text-purple-400" size={20} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Instant Preview</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
                            <FiSave className="text-green-600 dark:text-green-400" size={20} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Auto Save</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage