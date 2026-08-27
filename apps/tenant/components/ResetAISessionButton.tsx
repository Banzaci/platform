"use client";

import { getSessionId } from "@/app/faq/FAQChatClient";
import { apiClient } from "@/libs/api";
import { useSettings } from "@/providers/SettingsProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ResetAISessionButton() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  const {tenantId} = useSettings()
  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.api(`v1/tenants/${tenantId}/ai/chat/${sessionId}`, 
        {
          method: 'DELETE'
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-session", sessionId],
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {mutation.isPending ? "Resetting..." : "Reset AI session"}
    </button>
  );
}