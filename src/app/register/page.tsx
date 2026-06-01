"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Register failed"
        );

        return;
      }

      alert(
        "Register success!"
      );

      router.push("/login");

    } catch (error) {

      console.error(error);

      alert("Something went wrong");

    } finally {

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-10 border border-zinc-200 dark:border-zinc-800">

        <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-4">

          Join SparkUp

        </p>

        <h1 className="text-5xl font-bold tracking-tight mb-10">

          Register

        </h1>

        <form
          onSubmit={
            handleRegister
          }
          className="flex flex-col gap-5"
        >

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
          />

          <button
            disabled={loading}
            className="h-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium mt-4"
          >

            {loading
              ? "Loading..."
              : "Register"}

          </button>

        </form>

      </div>

    </main>
  );
}
