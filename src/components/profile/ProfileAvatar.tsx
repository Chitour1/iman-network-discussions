
import React from "react";

interface ProfileAvatarProps {
  url?: string | null;
  alt?: string;
  size?: number;
}

export default function ProfileAvatar({ url, alt = "الصورة الشخصية", size = 96 }: ProfileAvatarProps) {
  return (
    <div className="rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow -mt-14 ml-4" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={alt}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-xl text-gray-400 bg-gray-200">عضو</span>
      )}
    </div>
  );
}
