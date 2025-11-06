"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, Check, AlertCircle, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setError("Please upload a ZIP file");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const response = await fetch("http://localhost:3000/upload/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadProgress(100);
      setDeploymentUrl(data.url);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = () => {
    if (deploymentUrl) {
      navigator.clipboard.writeText(deploymentUrl);
    }
  };

  const resetForm = () => {
    setDeploymentUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(120,119,198,.1)_25%,rgba(120,119,198,.1)_26%,transparent_27%,transparent_74%,rgba(120,119,198,.1)_75%,rgba(120,119,198,.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(120,119,198,.1)_25%,rgba(120,119,198,.1)_26%,transparent_27%,transparent_74%,rgba(120,119,198,.1)_75%,rgba(120,119,198,.1)_76%,transparent_77%,transparent)] bg-[length:40px_40px]" />
      </div>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-50">
              Self-Host Your Web Projects
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Upload a ZIP file of your web project and deploy it instantly. No
              complicated setup, no waiting.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mt-12">
            {deploymentUrl ? (
              <div className="space-y-4">
                <div className="border border-emerald-500/50 bg-emerald-950/20 rounded-lg p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-medium text-zinc-50">
                    Deployment Successful!
                  </p>
                  <p className="text-sm text-zinc-400">
                    Your project is now live
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <code className="flex-1 text-sm text-zinc-300 break-all font-mono">
                    {deploymentUrl}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-50 rounded transition-colors whitespace-nowrap text-sm"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={resetForm}
                  className="w-full px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-50 rounded-lg font-medium transition-colors"
                >
                  Upload Another
                </button>
              </div>
            ) : (
              <>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 rounded-lg p-12 cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-950/10"
                      : "border-dashed border-zinc-700 hover:border-zinc-600 bg-zinc-900/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-3 text-center">
                    <div className="flex justify-center">
                      <Upload className="w-10 h-10 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-zinc-50">
                        Drop your ZIP file here
                      </p>
                      <p className="text-sm text-zinc-400">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Maximum file size: 5MB
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 border border-red-900/50 bg-red-950/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {isUploading && (
                  <div className="mt-6 space-y-2">
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 text-center">
                      Uploading... {Math.floor(uploadProgress)}%
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 rounded">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-medium text-zinc-50">Instant Deployment</h3>
              <p className="text-sm text-zinc-400">
                Your project goes live in seconds, not hours
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 rounded">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-medium text-zinc-50">Secure & Reliable</h3>
              <p className="text-sm text-zinc-400">
                Enterprise-grade infrastructure for your projects
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-800 rounded">
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-medium text-zinc-50">Full Control</h3>
              <p className="text-sm text-zinc-400">
                Complete freedom over your hosting and configuration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500 gap-4">
            <p>Selfhostly — Self-host your web projects with ease</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-300 transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-zinc-300 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-zinc-300 transition-colors">
                Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
