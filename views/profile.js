// Helper function to show notifications in-page
function showNotification(message, type) {
  let notificationDiv = document.getElementById('notification');
  if (!notificationDiv) {
    notificationDiv = document.createElement('div');
    notificationDiv.id = 'notification';
    // Optional: Insert at the top of the body
    document.body.prepend(notificationDiv);
  }
  notificationDiv.textContent = message;
  notificationDiv.style.display = 'block';
  notificationDiv.style.padding = '10px';
  notificationDiv.style.margin = '10px';
  notificationDiv.style.textAlign = 'center';
  if (type === 'success') {
    notificationDiv.style.backgroundColor = '#d4edda';
    notificationDiv.style.color = '#155724';
  } else if (type === 'error') {
    notificationDiv.style.backgroundColor = '#f8d7da';
    notificationDiv.style.color = '#721c24';
  } else {
    notificationDiv.style.backgroundColor = '#fff3cd';
    notificationDiv.style.color = '#856404';
  }
  setTimeout(() => {
    notificationDiv.style.display = 'none';
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Retrieve the token from localStorage.
  const token = localStorage.getItem("authToken");
  console.log("Profile page loaded, token found:", token);
  if (!token) {
    console.log("No token found in localStorage. Redirecting to login.");
    window.location.href = "/login.html";
    return;
  }

  // Select required DOM elements using your updated HTML IDs.
  const welcomeMessage = document.getElementById("welcome-message"); // Header welcome text element
  const emailInput = document.getElementById("email"); // Disabled email input
  const firstNameInput = document.getElementById("name");
  const lastNameInput = document.getElementById("surname");
  const facultySelect = document.getElementById("faculty");
  const groupSelect = document.getElementById("group");
  const profileForm = document.getElementById("userInfoForm");
  const logoutBtn = document.querySelector('.btn-danger[onclick="logout()"]');
  const changePasswordBtn = document.getElementById("change-password-btn");
  const verificationStatusDiv = document.getElementById("verificationStatus");

  // OTP modal elements.
  const verifyEmailBtn = document.getElementById("verifyEmailBtn");
  const otpModalEl = document.getElementById("otpModal");
  const confirmOtpBtn = document.getElementById("confirmOtpBtn");
  const cancelOtpBtn = document.getElementById("cancelOtpBtn");
  const otpInput = document.getElementById("otpInput");
  const otpResponseMsg = document.getElementById("otpResponseMessage");

  // Check that all required elements exist.
  if (
    !welcomeMessage ||
    !emailInput ||
    !firstNameInput ||
    !lastNameInput ||
    !facultySelect ||
    !groupSelect ||
    !profileForm ||
    !logoutBtn ||
    !changePasswordBtn ||
    !verificationStatusDiv ||
    !verifyEmailBtn ||
    !otpModalEl ||
    !confirmOtpBtn ||
    !cancelOtpBtn ||
    !otpInput ||
    !otpResponseMsg
  ) {
    console.error("One or more required elements are missing from the DOM.");
    return;
  }

  // Fetch user profile data from the backend.
  try {
    const response = await fetch("http://localhost:3000/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    console.log("GET /user/profile response status:", response.status);
    const data = await response.json();
    console.log("Data received from GET /user/profile:", data);

    if (!response.ok || !data.user) {
      console.error("Failed to fetch user data:", data.message || data);
      localStorage.removeItem("authToken");
      window.location.href = "/login.html";
      return;
    }

    const storedEmail = localStorage.getItem("email");

    // Use the user's name for the welcome message.
    welcomeMessage.textContent = "Welcome, " + (data.user.name || storedEmail || "Guest");


    // Populate the disabled email input (or leave it empty if desired)
    emailInput.value = localStorage.getItem("email") || "";


    // Populate other fields.
    firstNameInput.value = data.user.name || "";
    lastNameInput.value = data.user.surname || "";
    facultySelect.value = data.user.faculty || "CB";
    groupSelect.value = data.user.group || "2311";

    // Update verification status text based on the user's isVerified value.
    if (data.user.isVerified) {
      verificationStatusDiv.textContent = "Email Verified";
      verificationStatusDiv.classList.add("text-success");
      verificationStatusDiv.classList.remove("text-danger");
    } else {
      verificationStatusDiv.textContent = "contact admin: admin@admin";
      verificationStatusDiv.classList.add("text-danger");
      verificationStatusDiv.classList.remove("text-success");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    localStorage.removeItem("authToken");
    window.location.href = "/login.html";
    return;
  }

  // Handle profile update form submission.
  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const updatedData = {
      name: firstNameInput.value.trim(),
      surname: lastNameInput.value.trim(),
      faculty: facultySelect.value,
      group: groupSelect.value
    };
    try {
      const updateResponse = await fetch("http://localhost:3000/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });
      const result = await updateResponse.json();
      if (updateResponse.ok) {
        showNotification("Profile updated successfully!", "success");
      } else {
        showNotification("Error updating profile: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Error updating profile. Please try again.", "error");
    }
  });

  // Logout function remains unchanged.
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login.html";
  });

  // Show Change Password modal.
  changePasswordBtn.addEventListener("click", () => {
    const passwordModal = new bootstrap.Modal(document.getElementById("passwordModal"));
    passwordModal.show();
  });

  // Handle Change Password form submission:
  changePasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match.", "error");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword, confirmPassword })
      });
      const result = await response.json();
      if (response.ok) {
        showNotification("Password changed successfully. Please log in with your new password.", "success");
        const passwordModalEl = document.getElementById("passwordModal");
        const passwordModal = bootstrap.Modal.getInstance(passwordModalEl);
        if (passwordModal) {
          passwordModal.hide();
        }
        localStorage.removeItem("authToken");
        setTimeout(() => {
          window.location.href = "/login.html";
        }, 2000);
      } else {
        showNotification(result.message || "Error changing password.", "error");
      }
    } catch (error) {
      console.error("Error during password change:", error);
      showNotification("Error changing password. Please try again.", "error");
    }
  });

  // SEND VERIFICATION OTP:
  verifyEmailBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/send-verification-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        showNotification(data.message || "Error sending OTP", "error");
        return;
      }
      const modalObj = new bootstrap.Modal(otpModalEl);
      modalObj.show();
      otpResponseMsg.textContent = "";
      otpInput.value = "";
    } catch (error) {
      console.error("Error sending verification OTP:", error);
      showNotification("Could not send verification code. Try again later.", "error");
    }
  });

  // CONFIRM THE OTP:
  confirmOtpBtn.addEventListener("click", async () => {
    const userOtp = otpInput.value.trim();
    if (!userOtp) {
      otpResponseMsg.textContent = "Please enter the code first.";
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: userOtp })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        otpResponseMsg.textContent = "Email Verified Successfully!";
        verificationStatusDiv.textContent = "Email Verified";
        verificationStatusDiv.classList.add("text-success");
        verificationStatusDiv.classList.remove("text-danger");
        setTimeout(() => {
          const modalObj = bootstrap.Modal.getInstance(otpModalEl);
          modalObj.hide();
          window.location.reload();
        }, 1000);
      } else {
        otpResponseMsg.textContent = result.message || "Invalid OTP.";
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      otpResponseMsg.textContent = "Error verifying OTP.";
    }
  });

  // NEW: Results button event listener
  const resultsButton = document.getElementById("resultsButton");
resultsButton.addEventListener("click", () => {
  window.location.href = "/results_user.html";
});
});