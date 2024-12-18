"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GlbViewer = dynamic(() => import("./GlbViewer"), {
  ssr: false,
});

interface RenderFileProps {
  mimeType?: string;
  url: string;
  height?: number | string;
  width?: number | string;
  className?: string;
}

export function RenderFile({
  mimeType,
  url,
  height = 400,
  width = "100%",
  className = "",
}: RenderFileProps): JSX.Element | null {
  const [fileType, setFileType] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mime = mimeType || fileType;
  const isHTML =
    mime?.startsWith("text/html") ||
    mime?.startsWith("index/html") ||
    mime?.includes("application/xml");

  console.log("mime is", url, mime, fileType);

  useEffect(() => {
    if (!url) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(url);
        const contentType = response.headers.get("content-type");
        setFileType(contentType);

        if (contentType?.includes("application/json")) {
          const json = await response.json();
          setContent(JSON.stringify(json, null, 2));
        } else if (contentType?.includes("text/")) {
          const text = await response.text();
          setContent(text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      }
    };

    fetchContent();
  }, [url]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!fileType) {
    return <div className="text-gray-500">Loading...</div>;
  }

  // Try to determine mime type from URL if not provided
  if (!mime && url) {
    const extension = url.split(".").pop()?.toLowerCase();
    if (extension) {
      switch (extension) {
        case "jpg":
        case "jpeg":
          mimeType = "image/jpeg";
          break;
        case "png":
          mimeType = "image/png";
          break;
        case "gif":
          mimeType = "image/gif";
          break;
        case "mp4":
          mimeType = "video/mp4";
          break;
        case "mp3":
          mimeType = "audio/mpeg";
          break;
      }
    }
  }

  if (isHTML) {
    return (
      <iframe
        className={`${className} bg-white`}
        width={width}
        height={height}
        src={url}
        sandbox="allow-same-origin allow-scripts"
        frameBorder={0}
      />
    );
  }

  // Handle JSON and text content
  if (mime?.includes("application/json") || mime?.includes("text/")) {
    return (
      <pre
        className={`bg-gray-50 p-4 rounded-lg overflow-auto font-mono text-sm ${className}`}
        style={{ maxHeight: height, width, ...{ height, width } }}
      >
        {content}
      </pre>
    );
  }

  if (mime?.startsWith("video/")) {
    return (
      <video
        controls
        className={`max-w-full ${className}`}
        style={{ width, height }}
      >
        <source src={url} type={mimeType} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (mime?.startsWith("audio/")) {
    return (
      <audio
        controls
        className={`max-w-full ${className}`}
        style={{ width, height }}
      >
        <source src={url} type={mimeType} />
        Your browser does not support the audio tag.
      </audio>
    );
  }

  if (mime?.startsWith("image/")) {
    return (
      <img
        src={url}
        alt="Preview"
        className={`${className}`}
        style={{ width, height }}
      />
    );
  }

  if (mime?.startsWith("model/")) {
    return (
      <GlbViewer src={url} width={Number(width)} height={Number(height)} />
    );
  }

  return null;
}
