// // src/features/patent/routes/NavigationGuard.jsx

// import { useLayoutEffect, useRef } from "react";
// import { useLocation, Navigate } from "react-router-dom";

// const STACK_KEY = "nav:stack";
// const MAX_STACK = 50;

// const readStack = () => {
//   try {
//     const raw = sessionStorage.getItem(STACK_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// };

// const writeStack = (stack) => {
//   try {
//     sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
//   } catch {
//     /* ignore */
//   }
// };

// const NavigationGuard = ({ enabled = true }) => {
//   const location = useLocation();
//   const lastSafeRef = useRef(null);

//   // --- 1. Global Click Interceptor (Normal tracking) ---
//   useLayoutEffect(() => {
//     if (!enabled) return;

//     const handleGlobalClick = () => {
//       sessionStorage.setItem("nav:internal_click", "true");
//     };

//     window.addEventListener("click", handleGlobalClick, true);
//     return () => window.removeEventListener("click", handleGlobalClick, true);
//   }, [enabled]);

//   // --- 2. Route Guard Logic (useLayoutEffect for instant check) ---
//   const currentPath =
//     location.pathname + (location.search || "") + (location.hash || "");

//   // useLayoutEffect me check karte hain taaki paint hone se pehle redirect ho jaye
//   useLayoutEffect(() => {
//     if (!enabled) return;

//     const stack = readStack();
//     const lastSafe = lastSafeRef.current || stack[stack.length - 1];
//     const isInternalClick =
//       sessionStorage.getItem("nav:internal_click") === "true";
//     const isReload = currentPath === lastSafe;

//     if (!isInternalClick && !isReload) {
//       // Manual URL change detected -> Redirect will be handled by the return statement below
//       return;
//     }

//     // Safe navigation
//     sessionStorage.removeItem("nav:internal_click");

//     if (currentPath !== lastSafe) {
//       stack.push(currentPath);
//       writeStack(stack);
//     }
//     lastSafeRef.current = currentPath;
//   }, [currentPath, enabled]);

//   // --- 3. Instant Redirect via Component ---
//   // Agar internal click nahi hai aur reload bhi nahi hai, to Navigate component use karo.
//   // Ye React Router ko force karta hai ki wo immediately redirect kar de bina kisi extra render ke.
//   const stack = readStack();
//   const lastSafe = lastSafeRef.current || stack[stack.length - 1];
//   const isInternalClick =
//     sessionStorage.getItem("nav:internal_click") === "true";
//   const isReload = currentPath === lastSafe;

//   if (enabled && !isInternalClick && !isReload) {
//     const fallback = lastSafe || "/dashboard";
//     return <Navigate to={fallback} replace />;
//   }

//   return null;
// };

// export default NavigationGuard;
