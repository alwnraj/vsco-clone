"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);

  const checkBackendStatus = async () => {
    setChecking(true);
    try {
      // Create a timeout controller for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch("/api/upload", {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (response.ok) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch (error) {
      setStatus("offline");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkBackendStatus();
    }
  }, [mounted]);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Card className="p-4 mb-6 bg-gray-50 border-gray-200">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          <div>
            <p className="font-medium text-gray-600">Checking connection...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "online") {
    return (
      <Card className="p-4 mb-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Backend Connected</p>
            <p className="text-sm text-green-600">
              Full functionality available
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Demo Mode</p>
            <p className="text-sm text-amber-600">
              Backend not running. Run the Python script for full functionality.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkBackendStatus}
          disabled={checking}
          className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
        >
          {checking ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            "Check Again"
          )}
        </Button>
      </div>
    </Card>
  );
}
