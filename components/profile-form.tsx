
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [cameraStarting, setCameraStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // LOAD EXISTING PROFILE
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, bio, interests, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
      } else if (data) {
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setInterests(
          Array.isArray(data.interests)
            ? data.interests.join(", ")
            : ""
        );
        setAvatarUrl(data.avatar_url || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // STOP CAMERA WHEN COMPONENT UNMOUNTS
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // SAVE PROFILE
  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in again.");
      }

      const interestList = interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            bio: bio.trim(),
            interests: interestList,
            avatar_url: avatarUrl || null,
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      setMessage("Profile updated successfully!");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // UPLOAD PHOTO TO SUPABASE
  async function uploadPhoto(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select a valid image.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5 MB.");
    }

    setUploading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in again.");
      }

      const filePath = `${user.id}/${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { data: updatedProfile, error: updateError } =
        await supabase
          .from("profiles")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", user.id)
          .select("avatar_url")
          .single();

      if (updateError) throw updateError;

      setAvatarUrl(updatedProfile.avatar_url);
      setMessage("Profile photograph uploaded successfully!");
      router.refresh();
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // UPLOAD PHOTO SELECTED FROM DEVICE
  async function handlePhotoUpload(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      await uploadPhoto(file);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Photo upload failed."
      );
    } finally {
      e.target.value = "";
    }
  }

  // OPEN LIVE CAMERA
  async function openCamera() {
    setCameraError("");
    setCapturedPhoto("");
    setCameraStarting(true);
    setCameraOpen(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is unavailable. Please use HTTPS or a supported browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Unable to access the camera. Please check camera permission."
      );
    } finally {
      setCameraStarting(false);
    }
  }

  // CAPTURE PHOTO FROM LIVE CAMERA
  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      setCameraError("Camera is not ready yet. Please try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to capture photo.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPhoto(canvas.toDataURL("image/jpeg", 0.9));

    // Stop camera after capturing
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  // RETAKE PHOTO
  async function retakePhoto() {
    setCapturedPhoto("");
    await openCamera();
  }

  // USE CAPTURED PHOTO
  async function useCapturedPhoto() {
    if (!capturedPhoto) return;

    try {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `camera-photo-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      await uploadPhoto(file);

      setCapturedPhoto("");
      setCameraOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Photo upload failed."
      );
    }
  }

  // CLOSE CAMERA
  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCapturedPhoto("");
    setCameraOpen(false);
    setCameraError("");
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-300">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl md:p-10">

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Businessgarh
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Edit Your Profile
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Build your professional identity and connect with the Businessgarh community.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* PROFILE PHOTO */}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-200">
            Profile Photograph
          </label>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800/60 p-4 sm:flex-row sm:items-center">

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Your profile"
                className="h-24 w-24 rounded-full border-2 border-slate-600 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-700 text-4xl">
                👤
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap gap-3">

                <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={openCamera}
                  disabled={uploading}
                  className="rounded-xl border border-blue-500 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white disabled:opacity-50"
                >
                  📷 Take Photo
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Take a photo directly using your camera or choose an existing image. Maximum size: 5 MB.
              </p>

              {uploading && (
                <p className="mt-2 text-sm text-blue-400">
                  Uploading photograph...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CAMERA INTERFACE */}
        {cameraOpen && (
          <div className="rounded-2xl border border-blue-500/40 bg-slate-950 p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Take Your Profile Photo
            </h2>

            <div className="overflow-hidden rounded-xl bg-black">
              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured photo preview"
                  className="mx-auto max-h-[450px] w-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="max-h-[450px] w-full object-contain"
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {cameraStarting && (
              <p className="mt-3 text-center text-sm text-blue-300">
                Starting camera...
              </p>
            )}

            {cameraError && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {cameraError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {!capturedPhoto && !cameraStarting && !cameraError && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
                >
                  📸 Capture Photo
                </button>
              )}

              {capturedPhoto && (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    disabled={uploading}
                    className="rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={useCapturedPhoto}
                    disabled={uploading}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Use This Photo"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={closeCamera}
                disabled={uploading}
                className="rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* FULL NAME */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            maxLength={100}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* PROFESSIONAL BIO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Professional Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder="Tell us about your professional background..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <p className="mt-2 text-xs text-slate-500">
            Maximum 500 characters.
          </p>
        </div>

        {/* BUSINESS INTERESTS */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Business Interests
          </label>

          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Technology, Marketing, Finance"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <p className="mt-2 text-xs text-slate-500">
            Separate your interests with commas.
          </p>
        </div>

        {/* STATUS MESSAGE */}
        {message && (
          <div
            role="status"
            className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-300"
          >
            {message}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3 border-t border-slate-700 pt-6">
          <button
            type="submit"
            disabled={saving || uploading || cameraOpen}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/protected")}
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
