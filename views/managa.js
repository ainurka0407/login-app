console.log("managa.js loaded");
const manageTestsButton = document.getElementById("manageTestsButton");
if (manageTestsButton) {
  manageTestsButton.addEventListener("click", () => {
    window.location.href = "/manage_tests.html";
  });
} else {
  console.error("Manage Tests button not found.");
}


// Helper function to show notifications in-page
function showNotification(message, type) {
  let notificationDiv = document.getElementById('notification');
  if (!notificationDiv) {
    notificationDiv = document.createElement('div');
    notificationDiv.id = 'notification';
    document.body.prepend(notificationDiv);
  }
  notificationDiv.textContent = message;
  notificationDiv.style.display = 'block';
  notificationDiv.style.padding = '10px';
  notificationDiv.style.margin = '10px';
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

// Retrieve the token from localStorage
const token = localStorage.getItem("authToken");

// Fetch users from the server and populate the table
fetch('/user/get-users', {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`  // Include the token here
  }
})
  .then(response => response.json())
  .then(users => {
    console.log("Fetched users:", users);
    populateUserTable(users);
  })
  .catch(error => {
    console.error('Error fetching users:', error);
    showNotification('Failed to load user data.', 'error');
  });

// Populate the user table with fetched data
function populateUserTable(users) {
  const tableBody = document.getElementById('userTableBody');
  tableBody.innerHTML = ''; // Clear any existing rows

  users.forEach((user, index) => {
    const row = document.createElement('tr');
    // Use data attributes rather than inline onclick handlers
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.email}</td>
      <td>
        <button class="btn btn-warning change-password-btn" data-userid="${user._id}">Change Password</button>
        <button class="btn btn-danger delete-user-btn" data-userid="${user._id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  attachTableEventListeners();
}

// Attach event listeners to the table buttons
function attachTableEventListeners() {
  document.querySelectorAll('.delete-user-btn').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.getAttribute('data-userid');
      deleteUser(userId);
    });
  });

  document.querySelectorAll('.change-password-btn').forEach(button => {
    button.addEventListener('click', () => {
      const userId = button.getAttribute('data-userid');
      changePassword(userId);
    });
  });
}

// Display a custom delete confirmation modal and return a Promise that resolves to true or false
function showDeleteConfirmation() {
  return new Promise((resolve) => {
    const modalEl = document.getElementById('confirmDeleteModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    // Assign event handlers for confirmation and cancellation
    confirmBtn.onclick = () => {
      resolve(true);
      modal.hide();
    };

    cancelBtn.onclick = () => {
      resolve(false);
      modal.hide();
    };
  });
}

// Delete a user without using native alert/confirm
function deleteUser(userId) {
  console.log("deleteUser called for:", userId);
  showDeleteConfirmation().then((confirmed) => {
    if (confirmed) {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("authToken");

      fetch(`/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          showNotification(data.message, 'success');
          setTimeout(() => {
            window.location.reload(); // Reload the page to reflect the changes
          }, 2000);
        })
        .catch(error => {
          console.error('Error deleting user:', error);
          showNotification('Failed to delete the user.', 'error');
        });
    }
  });
}

// Show the "Change Password" modal and set the user ID in a hidden field
function changePassword(userId) {
  console.log("changePassword called for:", userId);
  document.getElementById('userIdToChange').value = userId;
  const modalEl = document.getElementById('changePasswordModal');
  new bootstrap.Modal(modalEl).show();
}

// Submit the new password without using alert()
function submitNewPassword() {
  const userId = document.getElementById('userIdToChange').value;
  const newPassword = document.getElementById('newPassword').value;

  if (newPassword.trim() === '') {
    showNotification('Please enter a valid password.', 'error');
    return;
  }

  fetch(`/user/admin/change-password/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`  // Include the token here as well
    },
    body: JSON.stringify({ password: newPassword })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Change password response:", data);
      showNotification(data.message, 'success');
      document.getElementById('changePasswordForm').reset();
      const modalEl = document.getElementById('changePasswordModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    })
    .catch(error => {
      console.error('Error changing password:', error);
      showNotification('Failed to change the password.', 'error');
    });
}

// Expose functions globally if inline event handlers or external scripts need them
window.deleteUser = deleteUser;
window.changePassword = changePassword;
window.submitNewPassword = submitNewPassword;

// Optionally, attach event listener to the modal "Save changes" button if not using inline handler:
document.addEventListener("DOMContentLoaded", () => {
  const savePasswordButton = document.querySelector("#changePasswordModal .btn-primary");
  if (savePasswordButton) {
    savePasswordButton.addEventListener("click", submitNewPassword);
  } else {
    console.error("Save changes button not found in the change password modal.");
  }
});


async function loadTestResults() {
  try {
    const response = await fetch("http://localhost:3000/test/all-results", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const results = await response.json();
    const resultsTableBody = document.querySelector("#resultsTable tbody");
    resultsTableBody.innerHTML = "";
    results.forEach(result => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${result.userEmail}</td>
        <td>${result.testName}</td>
        <td>${result.score}</td>
        <td>${result.total}</td>
        <td>${new Date(result.date).toLocaleString()}</td>
      `;
      resultsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching test results:", error);
    showNotification("Error fetching test results.", "error");
  }
}




document.addEventListener("DOMContentLoaded", () => {
  loadTestResults();

  const updateForm = document.getElementById("updateVideoForm");
  if (updateForm) {
    updateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const htmlVideoUrl = document.getElementById("htmlVideoUrl").value.trim();
      const cssVideoUrl = document.getElementById("cssVideoUrl").value.trim();
      const jsVideoUrl = document.getElementById("jsVideoUrl").value.trim();

      try {
        const response = await fetch("http://localhost:3000/video/update-urls", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify({ htmlVideoUrl, cssVideoUrl, jsVideoUrl })
        });
        const data = await response.json();
        if (!response.ok) {
          showNotification(data.message || "Failed to update video URLs.", "error");
          return;
        }
        showNotification("Video URLs updated successfully.", "success");
      } catch (error) {
        console.error("Error updating video URLs:", error);
        showNotification("Failed to update video URLs.", "error");
      }
    });
  }
});
