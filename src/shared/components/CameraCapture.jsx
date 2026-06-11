import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ label = "Take Photo", onPhotoCaptured }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  async function startCamera() {
    setMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setMessage("Camera could not be opened. Check browser camera permission.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOpen(false);
    setCameraReady(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;

    if (!video || !cameraReady || video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("Camera preview is still loading. Try again in a second.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage("Photo could not be captured.");
        return;
      }

      const photoFile = new File([blob], `crewpay-proof-photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      if (typeof onPhotoCaptured === "function") {
        onPhotoCaptured(photoFile);
      }

      stopCamera();
      setMessage("Photo captured. Review it before saving.");
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="camera-capture">
      {!cameraOpen && (
        <button type="button" onClick={startCamera}>
          {label}
        </button>
      )}

      {cameraOpen && (
        <div className="camera-capture-preview">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              setCameraReady(true);
              videoRef.current?.play();
            }}
            style={{
              display: "block",
              width: "100%",
              maxWidth: "320px",
              borderRadius: "0.75rem",
              border: "1px solid #d8d4ef",
            }}
          />

          <button type="button" onClick={capturePhoto} disabled={!cameraReady}>
            {cameraReady ? "Capture Photo" : "Loading Camera..."}
          </button>

          <button type="button" onClick={stopCamera}>
            Cancel Camera
          </button>
        </div>
      )}

      {message && <p className="helper">{message}</p>}
    </div>
  );
}
