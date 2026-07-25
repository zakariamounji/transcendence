"use client"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

const meta = [
  { name: "42", imageName: "42.svg", providerName: "42-school" },
  { name: "Google", imageName: "google.svg", providerName: "google" },
  { name: "GitHub", imageName: "github.svg", providerName: "github" }
]

export default function Auth(): React.JSX.Element {

  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  function clearInputs() {
    setEmail("")
    setPassword("")
    setName("")
  }

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

  return (
    <main className="min-h-screen min-w-full flex justify-center items-center p-4">
      <div className="flex justify-center items-center flex-col w-md">

        <h1 className="text-[12px] text-[#a1a1a1] max-w-85 text-center">
          {isSignUp ? "Register" : "Login"} with Email or the other providers to continue with Code battle.
        </h1>

        <Input
          aria-invalid={emailInputError ? "true" : "false"}
          placeholder="Email Address"
          type="email"
          className="border border-[#292929] h-11 rounded-md p-4 w-full mt-3 hover:border-[#494949]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          aria-invalid={passwordInputError ? "true" : "false"}
          placeholder="Password"
          type="password"
          className="border border-[#292929] h-11 rounded-md p-4 w-full mt-2.5 hover:border-[#494949]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isSignUp && (
          <Input
            aria-invalid={nameInputError ? "true" : "false"}
            placeholder="Name"
            type="text"
            className="border border-[#292929] h-11 rounded-md p-4 w-full mt-2.5 hover:border-[#494949]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <Button
          className="w-full mt-4 bg-white text-black h-12 text-[15px] hover:bg-white/80 cursor-pointer"
          onClick={() => isLoading !== "email" ? (
            isSignUp ? signUpEmail(email, password, name) : signInEmail(email, password)
          ) : undefined}
        >
          {isLoading === "email" ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={26}
              color="#000000"
              strokeWidth={1.5}
              className="animate-spin"
            />
          ) : (
            "Continue with Email"
          )}
        </Button>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2.5"> {errorMessage} </p>
        )}

        <span className="w-full h-px bg-[#FFFFFF25] mt-6 mb-2"/>

        {meta.map(item => (
          <Button
            key={item.providerName}
            className="w-full bg-[#1A1A1A] h-12 font-medium hover:bg-[#1A1A1A]/80 cursor-pointer
            border border-[#292929] flex items-center justify-center gap-4 mt-4"
            onClick={() => signInSocial(item.providerName)}
          >
            {isLoading === item.providerName ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={26}
                color="#ffffff"
                strokeWidth={1.5}
                className="animate-spin"
              />
            ) : (
              <>
                <Image
                  src={`/auth-providers/${item.imageName}`}
                  alt={item.name}
                  width={20}
                  height={20}
                  draggable={false}
                  className="w-5 h-5"
                />
                Continue with {item.name}
              </>
            )}
          </Button>
        ))}

        {isSignUp ? (
          <p className="text-[12px] text-[#a1a1a1] max-w-85 text-center mt-4">
            Already have an account?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => {
                setIsSignUp(false)
                clearAuth()
                clearInputs()
              }}
            >
              Login
            </button>
          </p>
        ) : (
          <p className="text-[12px] text-[#a1a1a1] max-w-85 text-center mt-4">
            Don&quot;t have an account?{" "}
            <button
              className="text-blue-500 hover:underline cursor-pointer"
              onClick={() => {
                setIsSignUp(true)
                clearAuth()
                clearInputs()
              }}
            >
              Register
            </button>
          </p>
        )}

        <div className="flex justify-center items-center gap-2 flex-wrap mt-2">
          <Link
            href="/terms-of-service"
            className="text-[10px] text-[#a1a1a1] max-w-85 text-center mt-4 hover:underline cursor-pointer"
          >
            Terms of Service
          </Link>
          <span className="text-[10px] text-[#a1a1a1] max-w-85 text-center mt-4"> | </span>
          <Link
            href="/privacy-policy"
            className="text-[10px] text-[#a1a1a1] max-w-85 text-center mt-4 hover:underline cursor-pointer"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </main>
  )
}