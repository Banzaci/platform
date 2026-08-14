"use client";

import { useForm } from "react-hook-form";
import type { ApiClient } from "@hotel/libs";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
};

type LoginFormProps = {
  apiClient: ApiClient;
  onSuccess?: () => void;
};

export function LoginForm({
  apiClient,
  onSuccess,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  async function onSubmit(data: LoginFormData) {
    console.log(apiClient);
    try {
      const result = await apiClient.api<LoginResponse>(
        "v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      apiClient.setToken(result.access_token);
      onSuccess?.();
    } catch(error) {
      console.log(error);
      setError("root", {
        message: "Invalid email or password",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          Password
        </label>

        <input
          type="password"
          {...register("password", {
            required: "Password is required",
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
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}