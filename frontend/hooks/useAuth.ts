import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function useAuth() {

  const router = useRouter()

  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailInputError, setEmailInputError] = useState<boolean>(false)
  const [passwordInputError, setPasswordInputError] = useState<boolean>(false)
  const [nameInputError, setNameInputError] = useState<boolean>(false)
  const [signInOut, setSignInOut] = useState<boolean>(false)

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async function signUpEmail(email: string, password: string, name: string) {
    try {

      if (!validateEmail(email.trim())) {
        setErrorMessage("Please enter a valid email address.")
        setEmailInputError(true)
        return
      }

      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.")
        setPasswordInputError(true)
        return
      }

      if (name.trim() === "") {
        setErrorMessage("Name cannot be empty.")
        setNameInputError(true)
        return
      }

      setEmailInputError(false)
      setPasswordInputError(false)
      setNameInputError(false)

      setIsLoading("email")
      const data = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL
      })
      if (data.error) {console.log(data.error)
        setErrorMessage(data.error.message || "An unexpected error occurred. Please try again.")
        if (data.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          setEmailInputError(true)
        }
        if (data.error.code === "PASSWORD_TOO_WEAK" || data.error.code === "PASSWORD_TOO_SHORT") {
          setPasswordInputError(true)
        }
        if (data.error.code === "VALIDATION_ERROR") {
          setErrorMessage("Validation error. Please check your email and try again.")
        }
      } else {
        router.push("/")
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.")
      setEmailInputError(true)
      setPasswordInputError(true)
      setNameInputError(true)
    } finally {
      setIsLoading(null)
      setTimeout(() => {
        setErrorMessage(null)
      }, 8000)
    }
  }

  async function signInSocial(provider: string) {
    try {
      setIsLoading(provider)
      const data = await authClient.signIn.social({
        provider: provider,
        callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL
      })
      if (data.error) {
        setErrorMessage(data.error.message || "An unexpected error occurred. Please try again.")
        setIsLoading(null)
      } else {
        router.push("/")
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setTimeout(() => {
        setIsLoading(null)
        setErrorMessage(null)
      }, 8000)
    }
  }

  async function signInEmail(email: string, password: string) {
    try {
      if (!validateEmail(email.trim())) {
        setErrorMessage("Please enter a valid email address.")
        setEmailInputError(true)
        return
      }

      if (password.length < 8) {
        setErrorMessage("Password must be at least 8 characters long.")
        setPasswordInputError(true)
        return
      }

      setEmailInputError(false)
      setPasswordInputError(false)

      setIsLoading("email")
      const data = await authClient.signIn.email({
        email,
        password,
        callbackURL: process.env.NEXT_PUBLIC_FRONTEND_URL
      })
      if (data.error) {
        setErrorMessage(data.error.message || "An unexpected error occurred. Please try again.")
        if (data.error.code === "USER_NOT_FOUND") {
          setEmailInputError(true)
        }
        if (data.error.code === "INVALID_PASSWORD") {
          setPasswordInputError(true)
        }
      } else {
        router.push("/")
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.")
      setEmailInputError(true)
      setPasswordInputError(true)
    } finally {
      setIsLoading(null)
      setTimeout(() => {
        setErrorMessage(null)
      }, 8000)
    }
  }

  async function signOut(): Promise<void> {
    try {
      setSignInOut(true)
      const data = await authClient.signOut()
      if (!data.error) {
        router.push("/auth")
      }
    } catch {} finally {
      setSignInOut(false)
    }
  }

  function clearAuth(): void {
    setErrorMessage(null)
    setEmailInputError(false)
    setPasswordInputError(false)
    setNameInputError(false)
  }

  return {
    isLoading,
    errorMessage,
    emailInputError,
    passwordInputError,
    nameInputError,
    signInOut,
    validateEmail,
    signUpEmail,
    signInSocial,
    signInEmail,
    clearAuth,
    signOut
  }
}