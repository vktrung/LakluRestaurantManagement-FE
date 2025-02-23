"use client";

import { useRef, useState } from "react";

const OTPInput = () => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus vào ô tiếp theo khi nhập xong
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d{4}$/.test(pasteData)) return; // Chỉ cho phép nhập 4 số

    setOtp(pasteData.split(""));
    pasteData.split("").forEach((digit, i) => {
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = digit;
      }
    });

    inputRefs.current[3]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`OTP Submitted: ${otp.join("")}`);
  };

  return (
    <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Verification</h1>
        <p className="text-[15px] text-slate-500">
          Enter the 4-digit verification code
        </p>
      </header>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-3">
          {otp.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          ))}
        </div>
        <div className="max-w-[260px] mx-auto mt-4">
          <button
            type="submit"
            className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150"
          >
            Verify Account
          </button>
        </div>
      </form>
      
    </div>
  );
};

export default OTPInput;
