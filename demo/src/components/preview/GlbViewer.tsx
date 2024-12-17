// import '@google/model-viewer/dist/model-viewer';
import "@google/model-viewer";

interface ModelViewerProps {
  src: string;
  width: number;
  height: number;
}

export const ModelViewer = ({ src, width, height }: ModelViewerProps) => {
  // @ts-ignore
  return (
    <model-viewer
      src={src}
      alt="A 3D model"
      auto-rotate
      camera-controls
      autoplay
      style={{ width: `${width || 300}px`, height: `${height || 300}px` }}
    />
  );
};

export default ModelViewer;
