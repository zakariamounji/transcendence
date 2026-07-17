const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("Signing in...");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Login successful! 🎉");
      // window.location.href = "/dashboard"; // Redirect to your protected route
    } else {
      setMessage(data.error || "Invalid credentials");
    }
  } catch (error) {
    setMessage("Failed to connect to the server.");
  }
};
