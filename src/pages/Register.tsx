import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/images/lws-logo-light.svg";
import Error from "../components/ui/Error";
import { useRegisterMutation } from "../features/auth/authAPI";
import { useNavigate } from "react-router-dom";
export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfrimPassword] = useState("");
  const [agree, setagree] = useState(false);
  const [error, setError] = useState("");
  const [register, { data, isLoading, isError, error: responseError }] =
    useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("password do not match");
    } else {
      register({
        name,
        email,
        password,
      });
    }
  };

  useEffect(() => {
    if (responseError) {
      if ("status" in responseError) {
        const errorMessage =
          "error" in responseError
            ? responseError.error
            : JSON.stringify(responseError.data);
        setError(errorMessage);
      }
    }
    if (data?.accessToken && data?.user) {
      navigate("/inbox");
    }
  }, [data, responseError, navigate]);
  return (
    <div className="grid place-items-center h-screen bg-[#F9FAFB]">
      <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/">
              <img
                className="w-auto h-12 mx-auto"
                src={logoImage}
                alt="Learn with sumit"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
              Create your account
            </h2>
          </div>
          {/* registration from */}
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
            method="POST"
          >
            <input type="hidden" name="remember" value="true" />
            <div className="-space-y-px rounded-md shadow-sm">
              {/* name */}
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="Name"
                  type="Name"
                  autoComplete="Name"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setName(e.target.value);
                  }}
                />
              </div>
              {/* email */}
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
              {/* password */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              {/* confirmPassword */}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-confirmPassword"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                  placeholder="confirmPassword"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setConfrimPassword(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-violet-600 focus:ring-violet-500"
                  checked={agree}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setagree(e.target.checked);
                  }}
                />
                <label
                  htmlFor="accept-terms"
                  className="block ml-2 text-sm text-gray-900"
                >
                  Agreed with the terms and condition
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"></span>
                Sign up
              </button>
            </div>
            {error !== "" && <Error message={error} />}
          </form>
        </div>
      </div>
    </div>
  );
}
