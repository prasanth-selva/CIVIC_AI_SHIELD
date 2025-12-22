const API_BASE = "https://227602680d90.ngrok-free.app";

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: "GET" });
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Health check error:", error);
    throw error;
  }
}

export async function uploadVideo(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/analyze_video`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Video upload error:", error);
    throw error;
  }
}

export async function sendLiveFrame(base64Frame) {
  try {
    const response = await fetch(`${API_BASE}/live_frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame_b64: base64Frame }),
    });
    if (!response.ok) throw new Error(`Frame analysis failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Live frame error:", error);
    throw error;
  }
}
