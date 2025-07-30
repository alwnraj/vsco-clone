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

      const response = await fetch("/api/upload-blob", {
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
      <Card className="p-3 mb-4 bg-slate-800/50 border-slate-600/30 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-700 rounded-lg">
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Checking connection...
            </p>
            <p className="text-xs text-slate-400 leading-tight">Please wait</p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "online") {
    return (
      <Card className="p-3 mb-4 bg-green-900/30 border-green-600/30 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-green-600/80 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-100" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-100">
              Backend Connected
            </p>
            <p className="text-xs text-green-300 leading-tight">
              Full functionality available
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 mb-4 bg-amber-900/30 border-amber-600/30 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-600/80 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-100" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-100">Demo Mode</p>
            <p className="text-xs text-amber-300 leading-tight">
              Backend not running. Run Python script for full functionality.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={checkBackendStatus}
          disabled={checking}
          className="border-amber-400/50 text-amber-200 bg-transparent rounded-xl text-xs px-2 h-7"
        >
          {checking ? <RefreshCw className="w-3 h-3" /> : "Check"}
        </Button>
      </div>
    </Card>
  );
}
