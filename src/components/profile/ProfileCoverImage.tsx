
import React from "react";

interface ProfileCoverImageProps {
  url?: string | null;
}

export default function ProfileCoverImage({ url }: ProfileCoverImageProps) {
  return (
    <div className="h-36 w-full rounded-t-xl bg-gray-200 relative overflow-hidden flex items-center justify-center">
      {url ? (
        <img
          src={url}
          alt="صورة الغلاف"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="text-gray-400">بدون غلاف</div>
      )}
    </div>
  );
}
