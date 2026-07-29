"use client"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const providers = [
  { name: "42", imageName: "42.svg", providerName: "42-school" },
  { name: "Google", imageName: "google.svg", providerName: "google" },
  { name: "GitHub", imageName: "github.svg", providerName: "github" }
] as const

const inputClassName = "border border-line h-12 rounded-md p-4 w-full hover:border-line-strong " +
  "bg-transparent dark:bg-transparent " +
  "disabled:bg-transparent dark:disabled:bg-transparent disabled:border-line disabled:opacity-50"

function Spinner(): React.JSX.Element {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      size={26}
      strokeWidth={1.5}
      className="animate-spin"
    />
  )
}

export default function AuthClient(): React.JSX.Element {

  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    isLoading,
    errorMessage,
    emailInputError,
    passwordInputError,
    nameInputError,
    signUpEmail,
    signInSocial,
    signInEmail,
    clearAuth
  } = useAuth()

  const busy = isLoading !== null
  const errorId = errorMessage ? "auth-error" : undefined

  function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") ?? "")
    const password = String(data.get("password") ?? "")

    if (isSignUp) {
      signUpEmail(email, password, String(data.get("name") ?? "unknown"))
    } else {
      signInEmail(email, password)
    }
  }

  function toggleMode() {
    setIsSignUp((previous) => !previous)
    clearAuth()
    formRef.current?.reset()
  }

  return (
    <main className="min-h-screen min-w-full flex justify-center items-center p-4">
      <div className={cn(
        "panel-sheen flex justify-center items-center flex-col w-md",
        "rounded-2xl border border-line bg-surface-1/80 p-6 sm:p-8"
      )}>

        <p className="text-gradient text-2xl font-medium tracking-tight"> Code Battle </p>

        <h1 className="text-[12px] text-dim max-w-85 text-center mt-2">
          {isSignUp ? "Register" : "Login"} with Email or the other providers to continue with Code battle.
        </h1>

        <form ref={formRef} onSubmit={onSubmit} noValidate className="w-full">

          <Input
            name="email"
            aria-label="Email Address"
            aria-invalid={emailInputError}
            aria-describedby={errorId}
            autoComplete="email"
            placeholder="Email Address"
            type="email"
            disabled={busy}
            className={cn(inputClassName, "mt-3")}
          />

          <Input
            name="password"
            aria-label="Password"
            aria-invalid={passwordInputError}
            aria-describedby={errorId}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder="Password"
            type="password"
            disabled={busy}
            className={cn(inputClassName, "mt-2.5")}
          />

          {isSignUp && (
            <Input
              name="name"
              aria-label="Name"
              aria-invalid={nameInputError}
              aria-describedby={errorId}
              autoComplete="name"
              placeholder="Name"
              type="text"
              disabled={busy}
              className={cn(inputClassName, "mt-2.5")}
            />
          )}

          <Button
            type="submit"
            disabled={busy}
            className={cn(
              "btn-brand w-full mt-4 h-12 text-[15px] cursor-pointer",
              isLoading === "email" ? "disabled:opacity-100" : "disabled:opacity-40"
            )}
          >
            {isLoading === "email" ? <Spinner /> : "Continue with Email"}
          </Button>

        </form>

        {errorMessage && (
          <p id="auth-error" role="alert" className="text-red-500 text-sm mt-2.5"> {errorMessage} </p>
        )}

        <span className="w-full h-px bg-line mt-6 mb-2"/>

        {providers.map((item) => (
          <Button
            key={item.providerName}
            type="button"
            disabled={busy}
            className={cn(
              `w-full bg-surface-3 h-12 font-medium hover:bg-surface-3/80 cursor-pointer
              border border-line hover:border-line-strong transition-colors flex items-center justify-center gap-4 mt-4 text-foreground`,
              isLoading === item.providerName ? "disabled:opacity-100" : "disabled:opacity-40"
            )}
            onClick={() => signInSocial(item.providerName)}
          >
            {isLoading === item.providerName ? (
              <Spinner />
            ) : (
              <>
                <Image
                  src={`/auth-providers/${item.imageName}`}
                  alt=""
                  width={22}
                  height={22}
                  priority
                  draggable={false}
                  className="w-5 h-5"
                />
                Continue with {item.name}
              </>
            )}
          </Button>
        ))}

        <p className="text-[12px] text-dim max-w-85 text-center mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-brand-bright hover:underline cursor-pointer"
            onClick={toggleMode}
          >
            {isSignUp ? "Login" : "Register"}
          </button>
        </p>

        <div className="flex justify-center items-center gap-2 flex-wrap mt-2">
          <Link
            href="/terms-of-service"
            className="text-[10px] text-dim max-w-85 text-center mt-4 hover:underline cursor-pointer"
          >
            Terms of Service
          </Link>
          <span className="text-[10px] text-dim max-w-85 text-center mt-4"> | </span>
          <Link
            href="/privacy-policy"
            className="text-[10px] text-dim max-w-85 text-center mt-4 hover:underline cursor-pointer"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </main>
  )
}