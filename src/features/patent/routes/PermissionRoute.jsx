// // src/features/patent/routes/PermissionRoute.jsx

// import { useEffect } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { usePermission } from "../hooks/usePermission";
// import Loader from "../common/Loader";

// const PermissionRoute = ({ resource, action = "view" }) => {
//   const { can } = usePermission();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const allowed = can(resource, action);

//   useEffect(() => {
//     if (!allowed) {
//       // Try to go back if possible, else fallback to dashboard
//       if (window.history.length > 2) {
//         window.history.back();
//       } else {
//         navigate("/dashboard", { replace: true });
//       }
//     }
//   }, [allowed, navigate, location.pathname]);

//   if (!allowed) {
//     return <Loader text="Redirecting..." />;
//   }

//   return <Outlet />;
// };

// export default PermissionRoute;
