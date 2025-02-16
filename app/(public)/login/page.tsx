"use client";
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import clsx from "clsx";
import styles from "./Login.module.scss";
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setError("Username cannot be empty");
      return false;
    }
    if (value.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) validateUsername(e.target.value);
  };

  const handleLogin = () => {
    if (validateUsername(username)) {
      if (username === "namdhhe171198") {
        router.push(`/otp?username=${username}`); //  Chuyển trang nếu username đúng
      } else {
        setError("Invalid username!"); //  Hiển thị lỗi nếu sai
      }
    }
  };

  return (
    <div className={clsx(styles.container, "flex items-center justify-center h-screen bg-black")}>
      <div className={clsx(styles.card, "bg-gray-900 p-8 rounded-lg shadow-md w-96 text-white")}>
        <h1 className="text-2xl font-semibold text-center mb-2">Login!</h1>
        <p className="text-gray-400 text-center mb-6">
          Please enter your credentials below to continue
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <Input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleChange}
            className="bg-gray-800 border-none text-white"
            isInvalid={!!error}
            errorMessage={error}
          />
        </div>
        <Button
          className="w-full bg-pink-400 text-black font-semibold"
          size="lg"
          onClick={handleLogin} // ✅ Kiểm tra trước khi chuyển trang
        >
          Login
        </Button>
      </div>
    </div>
  );
}
