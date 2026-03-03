"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authSlice";
import { apiClient } from "@/apis/client";
import { useFormik } from "formik";
import * as yup from "yup";
import Swal from "sweetalert2";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [passwordDiffError, setPasswordDiffError] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordErrorMessage =
    "Provided password doesn't match. Please verify";

  const isSignUpEnabled = COMPANY_ID !== "0";

  const referralCodeFromUrl = searchParams.get("referral_code") ?? "";

  const signUpSchema = yup.object({
    fname: yup
      .string()
      .label("First Name")
      .required("Please provide your first name"),
    lname: yup
      .string()
      .label("Last Name")
      .required("Please provide your last name"),
    email: yup
      .string()
      .label("Email")
      .email("Please provide a valid email")
      .required("Please provide your email"),
    password: yup
      .string()
      .label("Password")
      .min(6, "Password must be at least 6 characters long")
      .required("Please enter your password "),
    phone: yup
      .string()
      .label("Phone")
      .matches(/^[0-9]+$/, "Numbers only")
      .max(10, "Phone number must be 10 digits")
      .min(10, "Phone number must be 10 digits")
      .required("Please provide your phone number"),
    pin: yup
      .string()
      .label("Pin")
      .matches(/^[0-9]+$/, "Numbers only")
      .min(4, "Pin must be 4 digits")
      .max(4, "Pin must be 4 digits")
      .required("Please provide your 4 digit pin"),
    referral_code: yup.string().label("Referral Code"),
    address: yup
      .string()
      .label("Address")
      .required("Please provide your address"),
    city: yup
      .string()
      .label("City")
      .required("Please provide your city"),
    state: yup
      .string()
      .label("State")
      .required("Please provide your state"),
    zip: yup
      .string()
      .label("Zip")
      .matches(/^[0-9]+$/, "Numbers only")
      .min(4, "Please provide a valid zip")
      .max(5, "Please provide a valid zip")
      .required("Please provide your zip code"),
    preferred_payment: yup
      .string()
      .required("Payment option is required"),
    payment_email: yup
      .string()
      .label("Payment Email")
      .email("Please provide valid email"),
    payment_phone: yup
      .string()
      .label("Payment Phone")
      .matches(/^[0-9]+$/, "Numbers only")
      .max(10, "Phone number must be 10 digits")
      .min(10, "Phone number must be 10 digits")
      .nullable(),
  });

  const signUpInitialValues = {
    fname: "",
    lname: "",
    email: "",
    password: "",
    phone: "",
    pin: "",
    referral_code: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    preferred_payment: "paypal" as "paypal" | "zelle",
    payment_email: "",
    payment_phone: "",
  };

  const formik = useFormik({
    initialValues: referralCodeFromUrl
      ? { ...signUpInitialValues, referral_code: referralCodeFromUrl }
      : signUpInitialValues,
    validationSchema: signUpSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, setFieldError, resetForm }) => {
      setSignUpError(null);
      setSignUpSuccess(null);

      if (values.password && confirmPassword && values.password !== confirmPassword) {
        setPasswordDiffError(true);
        setSignUpError(passwordErrorMessage);
        setSubmitting(false);
        return;
      }

      const paymentEmail = values.payment_email?.trim() ?? "";
      const paymentPhone = values.payment_phone?.trim() ?? "";

      if (paymentEmail && paymentPhone) {
        setFieldError("payment_phone", "Please provide only one info");
        setFieldError("payment_email", "Please provide only one info");
        setSubmitting(false);
        return;
      }

      if (!paymentEmail && !paymentPhone) {
        setFieldError("payment_phone", "Please provide any one info");
        setFieldError("payment_email", "Please provide any one info");
        setSubmitting(false);
        return;
      }

      const requestData = Object.keys(values).reduce<Record<string, any>>(
        (obj, key) => {
          const value = (values as any)[key];
          if (
            Object.prototype.hasOwnProperty.call(signUpSchema.fields, key) &&
            value !== null &&
            value !== ""
          ) {
            obj[key] = value;
          }
          return obj;
        },
        {},
      );

      try {
        await apiClient.post(
          "/affiliate_customer/sign_up",
          requestData,
          {
            params: {
              company_id: COMPANY_ID,
            },
          },
        );

        setSignUpSuccess(
          "Account created successfully. Please check your email for next steps.",
        );
        setIsSignUpOpen(false);
        await Swal.fire({
          icon: "success",
          title: "Account created",
          text: "Sign up success! Login with your email and password.",
          confirmButtonColor: "#2563eb",
        });
        resetForm();
        setConfirmPassword("");
      } catch (err: any) {
        let message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to sign up. Please try again.";

        const detail = err?.response?.data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          message = detail.map((d: any) => d.msg).join(" ");
        } else if (
          detail &&
          typeof detail === "object" &&
          detail.status === "error" &&
          detail.data &&
          typeof detail.data === "object"
        ) {
          const fieldErrors: string[] = [];
          Object.values(detail.data).forEach((val: unknown) => {
            if (Array.isArray(val)) {
              (val as unknown[]).forEach((m) => {
                if (typeof m === "string") {
                  fieldErrors.push(m);
                }
              });
            }
          });
          if (fieldErrors.length > 0) {
            message = fieldErrors.join(" ");
          }
        }

        setSignUpError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!auth.accessToken || !auth.user) return;

    const userType = auth.user.user_type;

    if (userType === "staff") {
      router.replace("/admin-dashboard/customers");
    } else if (userType === "customer") {
      router.replace("/customer-dashboard");
    }
  }, [auth.accessToken, auth.user, router]);

  useEffect(() => {
    if (
      formik.values.password &&
      confirmPassword &&
      formik.values.password !== confirmPassword
    ) {
      setPasswordDiffError(true);
    } else if (
      formik.values.password &&
      confirmPassword &&
      formik.values.password === confirmPassword
    ) {
      setPasswordDiffError(false);
    }
  }, [confirmPassword, formik.values.password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const result = await dispatch(
        loginThunk({ username, password }),
      ).unwrap();

      const userType = result.user?.user_type;

      if (userType === "staff") {
        router.push("/admin-dashboard/customers");
      } else {
        router.push("/customer-dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to track your referrals, earnings, and payouts.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                    placeholder="Enter your password"
                  />
                </div>

            {(error || auth.error) && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error || auth.error}
              </p>
            )}

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {auth.loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {isSignUpEnabled && (
            <p className="mt-4 text-xs text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUpOpen(true);
                  setSignUpError(null);
                  setSignUpSuccess(null);
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </p>
          )}

          <p className="mt-4 text-xs text-center text-gray-400">
            By continuing, you agree to our{" "}
            <span className="font-medium text-gray-500">Terms</span> and{" "}
            <span className="font-medium text-gray-500">Privacy Policy</span>.
          </p>
        </div>
      </div>

      <Dialog
        open={isSignUpOpen}
        onClose={() => {
          setIsSignUpOpen(false);
          setSignUpError(null);
          setSignUpSuccess(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Sign up
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Create your affiliate account to start tracking referrals.
              </p>
            </div>
            <IconButton
              aria-label="close"
              onClick={() => {
                setIsSignUpOpen(false);
                setSignUpError(null);
                setSignUpSuccess(null);
              }}
              size="small"
              sx={{ color: "#9ca3af" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <div className="px-1 sm:px-2 py-1">
              <form
                onSubmit={formik.handleSubmit as unknown as (e: FormEvent<HTMLFormElement>) => void}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="fname"
                      value={formik.values.fname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="First name"
                    />
                    {formik.touched.fname && formik.errors.fname && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.fname}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lname"
                      value={formik.values.lname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Last name"
                    />
                    {formik.touched.lname && formik.errors.lname && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.lname}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="your@email.com"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Create a password"
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Re-enter password"
                    />
                    {formik.touched.password && passwordDiffError && (
                      <p className="text-xs text-red-500 mt-1">
                        {passwordErrorMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      maxLength={15}
                      name="phone"
                      value={formik.values.phone}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "phone",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Phone number"
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      PIN (4-digits)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      name="pin"
                      value={formik.values.pin}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "pin",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="4 digit PIN"
                    />
                    {formik.touched.pin && formik.errors.pin && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.pin}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Street address"
                    />
                    {formik.touched.address && formik.errors.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="City"
                    />
                    {formik.touched.city && formik.errors.city && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Zip
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      name="zip"
                      value={formik.values.zip}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "zip",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="ZIP code"
                    />
                    {formik.touched.zip && formik.errors.zip && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.zip}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <select
                      name="state"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                    >
                      <option value="">Select state</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                    {formik.touched.state && formik.errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {formik.errors.state}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-gray-700">
                      Preferred Payment
                    </p>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="preferred_payment"
                          value="paypal"
                          checked={formik.values.preferred_payment === "paypal"}
                          onChange={() =>
                            formik.setFieldValue("preferred_payment", "paypal")
                          }
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span>Paypal</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name="preferred_payment"
                          value="zelle"
                          checked={formik.values.preferred_payment === "zelle"}
                          onChange={() =>
                            formik.setFieldValue("preferred_payment", "zelle")
                          }
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span>Zelle</span>
                      </label>
                    </div>
                    {formik.touched.preferred_payment &&
                      formik.errors.preferred_payment && (
                        <p className="text-xs text-red-500 mt-1">
                          {formik.errors.preferred_payment}
                        </p>
                      )}
                  </div>

                  <div className="space-y-4 sm:col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Account Email
                        {formik.values.preferred_payment === "paypal" && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        type="email"
                        name="payment_email"
                        value={formik.values.payment_email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                        placeholder="Payment account email"
                      />
                      {formik.touched.payment_email &&
                        formik.errors.payment_email && (
                          <p className="text-xs text-red-500 mt-1">
                            {formik.errors.payment_email}
                          </p>
                        )}
                    </div>

                    {formik.values.preferred_payment === "zelle" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment Account Phone Number{" "}
                          <span className="text-gray-400">
                            (optional if email provided)
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="payment_phone"
                          value={formik.values.payment_phone}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "payment_phone",
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          onBlur={formik.handleBlur}
                          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                          placeholder="Phone number for Zelle"
                        />
                        {formik.touched.payment_phone &&
                          formik.errors.payment_phone && (
                            <p className="text-xs text-red-500 mt-1">
                              {formik.errors.payment_phone}
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Referral Code
                    </label>
                    <input
                      type="text"
                      name="referral_code"
                      value={formik.values.referral_code}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                      placeholder="Enter referral code (optional)"
                    />
                    {formik.touched.referral_code &&
                      formik.errors.referral_code && (
                        <p className="text-xs text-red-500 mt-1">
                          {formik.errors.referral_code}
                        </p>
                      )}
                  </div>
                </div>

                {signUpError && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {signUpError}
                  </p>
                )}
                {signUpSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    {signUpSuccess}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUpOpen(false);
                      setSignUpError(null);
                      setSignUpSuccess(null);
                    }}
                    className="inline-flex justify-center items-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      formik.isSubmitting ||
                      passwordDiffError ||
                      Object.keys(formik.errors).length > 0
                    }
                    className="inline-flex justify-center items-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
                  >
                    {formik.isSubmitting ? "Signing up..." : "Sign up"}
                  </button>
                </div>
              </form>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }} />
      </Dialog>
    </div>
  );
}
