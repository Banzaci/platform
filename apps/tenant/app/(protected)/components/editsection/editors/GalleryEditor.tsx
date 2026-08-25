/* eslint-disable @typescript-eslint/no-explicit-any */
import ImageUpload from "../../ImageUpload";

type GalleryImage = {
  image?: string;
  alt?: string;
};

type Props = {
  content: {
    heading?: {
      en?: string;
    };
    images?: GalleryImage[];
    [key: string]: any;
  };
  onChange: (content: any) => void;
};

export default function GalleryEditor({
  content,
  onChange,
}: Props) {
  const images = content.images ?? [];

  function updateHeading(value: string) {
    onChange({
      ...content,
      heading: {
        ...content.heading,
        en: value,
      },
    });
  }

  function updateImage(
    index: number,
    key: keyof GalleryImage,
    value: string
  ) {
    const nextImages = images.map((image, i) =>
      i === index
        ? {
            ...image,
            [key]: value,
          }
        : image
    );

    onChange({
      ...content,
      images: nextImages,
    });
  }

  function addImage() {
    onChange({
      ...content,
      images: [
        ...images,
        {
          image: "",
          alt: "",
        },
      ],
    });
  }

  function removeImage(index: number) {
    onChange({
      ...content,
      images: images.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="text-black">
      <h3 className="mb-5 text-lg font-semibold">
        Gallery
      </h3>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium">
          Heading
        </span>

        <input
          value={content.heading?.en ?? ""}
          onChange={(e) => updateHeading(e.target.value)}
          className="w-full rounded-lg border px-4 py-3"
        />
      </label>

      <div className="space-y-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="rounded-xl border p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium">
                Image {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  Uplaod image
                </span>
                <ImageUpload
                  value={content.image}
                  onChange={(image) =>
                    onChange({
                      ...content,
                      image,
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">
                  Alt text
                </span>

                <input
                  value={image.alt ?? ""}
                  onChange={(e) =>
                    updateImage(
                      index,
                      "alt",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>

              {image.image && (
                <img
                  src={image.image}
                  alt={image.alt ?? ""}
                  className="h-32 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addImage}
        className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium"
      >
        + Add image
      </button>
    </div>
  );
}