import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/daibmetalogo.jpeg";
import { useLogin } from "./queries";
import { useToast } from "../../common/toast/ToastContext";
import { TextInput, Checkbox, FormButton } from "../../common/form";

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: "swapnil@netswaptech.com",
    password: "Admin@12345",
    remember: false,
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    loginMutation.mutate(
      {
        email: values.email,
        password: values.password,
        remember: values.remember,
      },
      {
        onSuccess: () => {
          toast.success("Welcome back! Login successful");
          navigate("/dashboard");
        },
        onError: (err) => {
          const data = err.response?.data;
          const msg =
            data?.errors?.email?.[0] ||
            data?.errors?.password?.[0] ||
            data?.message ||
            "Login failed. Please try again.";
          toast.error(msg);
        },
        onSettled: () => setSubmitting(false),
      },
    );
  };

  const handleOtpLogin = () => {
    navigate("/verify-email");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-4">
      <div className="w-full max-w-md rounded-xl border border-ink-200 bg-surface p-6 shadow-sm sm:p-8">
        <img
          src={logo}
          alt="DiabMeta - Diabetes, Thyroid & Obesity Clinic"
          className="mx-auto mb-6 h-24 w-auto"
        />

        <h1 className="font-jakarta text-2xl font-bold tracking-tight text-ink-900">
          Welcome back
        </h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">
          Sign in to your clinical admin panel
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              {/* Email */}
              <TextInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="doctor@example.com"
                required
              />

              {/* Password with show/hide */}
              <div className="relative">
                <TextInput
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[32px] text-ink-500 hover:text-ink-900 sm:top-[38px]"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={18} />
                  ) : (
                    <MdVisibility size={18} />
                  )}
                </button>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <Checkbox label="Remember me" name="remember" />
                <a
                  href="#"
                  className="-mt-3 text-xs font-medium text-brand-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <FormButton
                type="submit"
                text={
                  loginMutation.isPending || isSubmitting
                    ? "Signing in..."
                    : "Sign In"
                }
                disabled={loginMutation.isPending || isSubmitting}
              />

              {/* Divider */}
              <div className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                <span className="h-px flex-1 bg-ink-200" />
                or
                <span className="h-px flex-1 bg-ink-200" />
              </div>

              {/* OTP button */}
              <button
                type="button"
                onClick={handleOtpLogin}
                className="h-11 w-full rounded-lg border border-form-border bg-surface text-sm font-medium text-ink-900 transition hover:bg-ink-50"
              >
                Login with OTP
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
