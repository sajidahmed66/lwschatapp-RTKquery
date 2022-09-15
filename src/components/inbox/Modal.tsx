import React, { useState } from "react";
import isValidEmail from "../../utils/isValidEmail";
export interface IModalProps {
  open: boolean;
  control: () => void;
}

const Modal = ({ open, control }: IModalProps) => {
  const [to, setTo] = useState(""); // email
  const [message, setMessage] = useState("");

  const updateTo = (value: string) => {
    if (isValidEmail(value)) {
      console.log("varified");
    }
    setTo(value);
  };

  const debounced = (fn: Function, ms: number) => {
    let timeoutId: NodeJS.Timeout | undefined;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, ms);
    };
  };

  const handleEmailWithdebounce = (e: React.ChangeEvent<HTMLInputElement>) =>
    debounced((value: string) => updateTo(value), 1000)(e.target.value);

  return open ? (
    <>
      <div
        onClick={control}
        className="fixed inset-0 z-10 w-full h-full cursor-pointer bg-black/50"
      ></div>
      <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Send message
        </h2>
        <form className="mt-8 space-y-6" method="POST">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="to" className="sr-only">
                To
              </label>
              <input
                id="to"
                name="to"
                type="email"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Send to"
                // value={to}
                onChange={(e) => handleEmailWithdebounce(e)}
              />
            </div>
            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                // type="message"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Message"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              Send Message
            </button>
          </div>

          {/* <Error message="There was an error" /> */}
        </form>
      </div>
    </>
  ) : (
    <></>
  );
};

export default Modal;
