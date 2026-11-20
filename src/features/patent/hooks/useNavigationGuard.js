// // src/features/patent/hooks/useNavigationGuard.js

// import { useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const STACK_KEY = "nav:stack";
// const MAX_STACK = 50;

// const readStack = () => {
//     try {
//         const raw = sessionStorage.getItem(STACK_KEY);
//         return raw ? JSON.parse(raw) : [];
//     } catch {
//         return [];
//     }
// };

// const writeStack = (stack) => {
//     try {
//         sessionStorage.setItem(STACK_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
//     } catch {
//         /* ignore */
//     }
// };

// /**
//  * Tracks legitimate in-app navigation.
//  * - `markNextNavigation()` should be called right before navigate()/Link click
//  *   in your app when you WANT to allow the navigation.
//  * - If the pathname changes WITHOUT that marker, the user tampered with the URL
//  *   (or came from outside the app), and we redirect back to the last safe path.
//  */
// export const useNavigationGuard = ({ enabled = true } = {}) => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const allowNextRef = useRef(false);
//     const lastSafeRef = useRef(null);

//     // Expose a function that any link/button can call before navigating
//     const markNextNavigation = () => {
//         allowNextRef.current = true;
//     };

//     useEffect(() => {
//         if (!enabled) return;

//         const currentPath =
//             location.pathname + (location.search || "") + (location.hash || "");
//         const stack = readStack();
//         const lastSafe = lastSafeRef.current || stack[stack.length - 1];

//         if (allowNextRef.current) {
//             // Legitimate navigation → accept it and record
//             allowNextRef.current = false;
//             lastSafeRef.current = currentPath;
//             writeStack([...stack, currentPath]);
//             return;
//         }

//         // First load: no history → assume legitimate, seed the stack
//         if (stack.length === 0) {
//             lastSafeRef.current = currentPath;
//             writeStack([currentPath]);
//             return;
//         }

//         // Reload of same page (browser refresh) → allow
//         if (currentPath === lastSafe) {
//             return;
//         }

//         // Otherwise: URL was tampered with → redirect back
//         if (lastSafe) {
//             navigate(lastSafe, { replace: true });
//         } else {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [location, navigate, enabled]);

//     return { markNextNavigation };
// };