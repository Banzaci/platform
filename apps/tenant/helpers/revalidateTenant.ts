"use server";

import { revalidateTag } from "next/cache";

export async function revalidateTenant(host: string) {
  revalidateTag(`tenant:${host}`, "max");
}