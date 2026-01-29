import { CardSpotlight } from "../../components/ui/card-spotlight";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../../lib/auth/AuthApi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function Register() {
  const [formData, setFormData] = useState({
    phone_number: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, phone_number: value || "" }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { access, refresh, user } = await AuthAPI.register(formData);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_data", JSON.stringify(user));
      navigate("/profile", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.phone_number?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.non_field_errors?.[0] ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <CardSpotlight className="w-full max-w-3xl">
        <div className="shadow-input mx-auto w-full rounded-none p-4 md:rounded-2xl md:p-8 z-20 relative bg-white/5 dark:bg-transparent">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Register
          </h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
            Aveti deja cont?{" "}
            <a
              href="/login"
              className="underline hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            >
              Conectati-va aici.
            </a>
          </p>

          <form className="my-8 z-20" onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <LabelInputContainer>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Tyler"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Durden"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="projectmayhem@fc.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="phone_number">Phone number *</Label>
                <PhoneInput
                  international
                  defaultCountry="RO"
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  inputComponent={Input}
                  className={cn(
                    "flex gap-2 items-center h-10 w-full",
                    "[&_.PhoneInputCountry]:mr-0 [&_.PhoneInputCountry]:flex [&_.PhoneInputCountry]:items-center [&_.PhoneInputCountry]:justify-center",
                    "[&_.PhoneInputCountrySelect]:bg-transparent",
                    "[&_.group\/input]:w-full",
                    "dark:[&_select]:bg-zinc-900 dark:[&_option]:text-neutral-900 dark:[&_option]:bg-white" // for the dropdown 
                  )}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password_confirm">Confirm Password *</Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </LabelInputContainer>
            </div>

            <div className="mt-8">
              <button
                className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? "Registering..." : "Sign up"} &rarr;
                <BottomGradient />
              </button>

              <div className="my-6 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

              <div className="flex flex-col space-y-4">
                <button
                  className="group/btn shadow-input relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                  type="button"
                  onClick={() => {
                    console.log("Google signup clicked");
                  }}
                >
                  <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Sign up with Google
                  </span>
                  <BottomGradient />
                </button>
              </div>
            </div>
          </form>
        </div>
      </CardSpotlight>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
