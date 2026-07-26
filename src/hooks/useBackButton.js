// hooks/useCapacitorBackButton.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only register listener on native mobile hardware (Android/iOS)
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      // 1. If user is on the main root page, minimize the app
      if (location.pathname === "/") {
        CapacitorApp.minimizeApp();
      }
      // 2. If there is history to go back to, navigate to previous screen
      else if (canGoBack) {
        navigate(-1);
      }
      // 3. Fallback: return to home screen
      else {
        navigate("/");
      }
    });

    return () => {
      listener.then((handler) => handler.remove());
    };
  }, [navigate, location]);
}
