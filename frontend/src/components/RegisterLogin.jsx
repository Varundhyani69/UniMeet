import { useState, useEffect } from "react";
import axios from "../axios.js";

import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const RegisterLogin = () => {
    const navigate = useNavigate();
    const [choice, setChoice] = useState('register');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/me`, { withCredentials: true })
            .then(() => navigate('/dashboard'))
            .catch(() => { });
    }, []);



    const [regDetails, setRegDetails] = useState({
        username: '',
        email: '',
        password: ''
    });

    const changeRegEventHandler = (e) => {
        setRegDetails({ ...regDetails, [e.target.name]: e.target.value });
    };

    const submitRegDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/register`, regDetails, { withCredentials: true });
            if (res.status === 200) {
                toast.success(res.data.message);
                setChoice('login');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response.data.message);
            console.error('Registration error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }

    const [loginDetails, setLoginDetails] = useState({
        username: '',
        password: ''
    });

    const changeLoginEventHandler = (e) => {
        setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
    };

    const submitLoginDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/login`, loginDetails, { withCredentials: true });
            if (res.status === 200) {
                toast.success(res.data.message);
                navigate('/dashboard');
            }

        } catch (error) {
            toast.error(error.response.data.message);
            console.log('Login error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-[#FFF3E2]">
            <div className="w-full max-w-md space-y-4">
                {/* Logo + Brand */}
                <div className="flex items-center justify-center gap-3">
                    <img className="h-12 sm:h-16" src="Logo.png" alt="Logo" />
                    <h1 style={{ fontFamily: '"Keania One", cursive' }} className="text-3xl sm:text-4xl">
                        <span className="text-black">Uni</span>
                        <span className="text-[#FEC674]">Meet</span>
                    </h1>
                </div>

                {/* Form Card */}
                <div className="relative rounded-3xl p-5 sm:p-6 bg-[#FEC674]">
                    {/* Submit Icon Button */}
                    <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#FFF3E2] rounded-tl-full">
                        <button
                            type="button"
                            onClick={() => document.getElementById("main-form").requestSubmit()}
                            className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center absolute right-1 left-2 top-2 bottom-1 shadow-md hover:bg-gray-800 transition"
                            title="Submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loader mr-2"></span>
                            ) : (
                                < i className="text-2xl text-[#FEC674] fa-solid fa-arrow-right"></i>
                            )}

                        </button>
                    </div>

                    {/* Form Title */}
                    <h1 className="text-xl sm:text-2xl font-inter text-center mb-4">
                        {choice === "register" ? "Register" : "Login"}
                    </h1>

                    {/* Form Fields */}
                    <form id="main-form" onSubmit={choice === "register" ? submitRegDetails : submitLoginDetails}>
                        <input
                            className="bg-[#FFF3E2] text-black w-full border-none rounded-3xl pl-4 p-2 focus:ring-0 mt-3"
                            name="username"
                            required
                            onChange={choice === "register" ? changeRegEventHandler : changeLoginEventHandler}
                            value={choice === "register" ? regDetails.username : loginDetails.username}
                            type="text"
                            placeholder="Enter username"
                        />

                        {choice === "register" && (
                            <input
                                className="bg-[#FFF3E2] text-black w-full rounded-3xl pl-4 p-2 mt-3 border-none focus:ring-0"
                                name="email"
                                required
                                onChange={changeRegEventHandler}
                                value={regDetails.email}
                                type="email"
                                placeholder="Enter email"
                            />
                        )}

                        <input
                            className="bg-[#FFF3E2] text-black w-full rounded-3xl pl-4 p-2 mt-3 mb-2 border-none focus:ring-0"
                            name="password"
                            required
                            onChange={choice === "register" ? changeRegEventHandler : changeLoginEventHandler}
                            value={choice === "register" ? regDetails.password : loginDetails.password}
                            type="password"
                            placeholder="Enter password"
                        />

                        <button className="hidden" type="submit">
                            {choice === "register" ? "Register" : "Login"}
                        </button>
                    </form>

                    <span
                        className="pl-2 text-sm mt-2 inline-block cursor-pointer text-black hover:underline"
                        onClick={() => setChoice(choice === "register" ? "login" : "register")}
                    >
                        {choice === "register" ? "Already have an account?" : "Don't have an account?"}
                    </span>
                </div>
            </div>
        </div >
    );
};

export default RegisterLogin;
