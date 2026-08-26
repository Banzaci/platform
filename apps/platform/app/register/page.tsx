"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import type { ApiClient } from "@hotel/libs";
import { apiClient } from "@/libs/api";

type RegisterForm = {
  email: string;
  phone_number: string;
  password: string;
};

type RegisterResponse = {
  access_token: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  async function onSubmit(data: RegisterForm) {
    try {
      const result = await apiClient.api<RegisterResponse>(
        "v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      apiClient.setToken(result.access_token);
      router.push("/login");
    } catch (error){
      setError("root", {
        message: "Registration failed",
      });
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Start building your hotel website.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              {...register("email", {
                required: "Email is required",
              })}
              className="w-full rounded-lg border px-4 py-3"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone number
            </label>

            <input
              type="tel"
              {...register("phone_number", {
                required: "Phone number is required",
              })}
              className="w-full rounded-lg border px-4 py-3"
            />

            {errors.phone_number && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              className="w-full rounded-lg border px-4 py-3"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-500">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}