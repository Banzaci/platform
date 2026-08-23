"use client";

import { FormEvent, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

import { apiClient } from "@/libs/api";
import { Page, TenantResponse } from "@hotel/types";

export default function TenantPage({ tenantId}: { tenantId: string }) {

  const queryClient = useQueryClient();

  const [pageName, setPageName] = useState("");
  const [localPages, setLocalPages] = useState<Page[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const result =
        await apiClient.api<TenantResponse>(
          `v1/tenants/${tenantId}`
        );

      setLocalPages(result.pages);

      return result;
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const addPage = useMutation({
    mutationFn: (name: string) =>
      apiClient.api(
        `v1/tenants/${tenantId}/pages`,
        {
          method: "POST",
          body: JSON.stringify({
            name,
          }),
        }
      ),

    onSuccess: async () => {
      setPageName("");

      await queryClient.invalidateQueries({
        queryKey: [
          "tenant",
          tenantId,
        ],
      });
    },
  });

  const deletePage = useMutation({
    mutationFn: (pageId: string) =>
      apiClient.api(
        `v1/tenants/${tenantId}/pages/${pageId}`,
        {
          method: "DELETE",
        }
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "tenant",
          tenantId,
        ],
      });
    },
  });

  const reorderPages = useMutation({
    mutationFn: (pages: Page[]) =>
      apiClient.api(
        `v1/tenants/${tenantId}/pages/reorder`,
        {
          method: "PUT",
          body: JSON.stringify({
            pages: pages.map(
              (page, index) => ({
                id: page.id,
                sort_order: index,
              })
            ),
          }),
        }
      ),
  });

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value = pageName.trim();

    if (!value) {
      return;
    }

    addPage.mutate(value);
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setLocalPages((current) => {
      const oldIndex =
        current.findIndex(
          (page) =>
            page.id === active.id
        );

      const newIndex =
        current.findIndex(
          (page) =>
            page.id === over.id
        );

      const reordered = arrayMove(
        current,
        oldIndex,
        newIndex
      );

      reorderPages.mutate(reordered);

      return reordered;
    });
  }

  if (isLoading) {
    return null;
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-red-600">
          Kunde inte hämta tenant.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold">
            Add page
          </h2>

          <div className="mt-4 flex gap-3">
            <input
              value={pageName}
              onChange={(event) =>
                setPageName(
                  event.target.value
                )
              }
              placeholder="About us"
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
            />

            <button
              type="submit"
              disabled={
                !pageName.trim() ||
                addPage.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />

              {addPage.isPending
                ? "Adding..."
                : "Add page"}
            </button>
          </div>
        </form>

        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localPages.map(
              (page) => page.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {localPages.map(
                (page) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    onDelete={() => {
                      if (
                        page.slug !==
                          "index" &&
                        window.confirm(
                          `Delete "${page.name.en}"?`
                        )
                      ) {
                        deletePage.mutate(
                          page.id
                        );
                      }
                    }}
                    deleting={
                      deletePage.isPending
                    }
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>

        <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
          {JSON.stringify(
            {
              ...data,
              pages: localPages,
            },
            null,
            2
          )}
        </pre>
      </div>
    </main>
  );
}

function SortablePage({
  page,
  onDelete,
  deleting,
}: {
  page: Page;
  onDelete: () => void;
  deleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: page.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 ${
        isDragging
          ? "opacity-60 shadow-lg"
          : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900">
          {page.name.en}
        </div>

        <div className="text-sm text-gray-400">
          /{page.slug}
        </div>
      </div>

      {page.slug !== "index" && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}