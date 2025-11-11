// Dish detail page logic
(function () {
  const params = new URLSearchParams(location.search);
  const dishId = params.get('id');
  let currentDish = null; // Store current dish data
  
  if (!dishId) {
    document.querySelector('.container').innerHTML = '<p class="error-message">No dish ID provided.</p>';
    return;
  }

  // Load dish detail
  async function loadDishDetail() {
    try {
      const url = `${GET_DISH_BY_ID_URL}&id=${encodeURIComponent(dishId)}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to load dish');
      }
      
      const data = await res.json();
      console.log('Dish detail:', data);
      
      if (!data.success || !data.dish) {
        throw new Error('Dish not found');
      }
      
      const dish = data.dish;
      currentDish = dish; // Store for later use
      
      // Parse tags if it's a string
      let tags = dish.tags || [];
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [];
        }
      }
      
      // Fix image URL
      let imageUrl = dish.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image';
      if (imageUrl.startsWith('/')) {
        imageUrl = BLOB_BASE_URL + imageUrl;
        if (BLOB_SAS_TOKEN) {
          imageUrl += BLOB_SAS_TOKEN;
        }
      }
      
      // Update DOM
      document.getElementById('dishTitle').textContent = dish.title || 'Untitled';
      document.getElementById('dishDescription').textContent = dish.description || 'No description';
      document.getElementById('dishCuisine').textContent = dish.cuisine || 'N/A';
      document.getElementById('dishTags').textContent = Array.isArray(tags) ? tags.join(', ') : 'N/A';
      document.getElementById('dishImage').src = imageUrl;
      
      // Display author (we'll need to fetch user info, for now show userId)
      document.getElementById('dishAuthor').textContent = `Uploaded by User ${dish.userId || 'Unknown'}`;
      
      // Display date
      const createdDate = dish.createdAt ? new Date(dish.createdAt).toLocaleDateString() : 'Unknown date';
      document.getElementById('dishDate').textContent = createdDate;
      
      // Show edit/delete buttons if user is the owner
      checkOwnership(dish.userId);
      
    } catch (err) {
      console.error('Error loading dish:', err);
      document.querySelector('.detail-content').innerHTML = '<p class="error-message">Failed to load dish details.</p>';
    }
  }

  // Load comments
  async function loadComments() {
    const commentsList = document.getElementById('commentsList');
    const commentMsg = document.getElementById('commentMsg');
    
    try {
      const url = `${GET_COMMENTS_URL}&dishId=${encodeURIComponent(dishId)}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to load comments');
      }
      
      const data = await res.json();
      console.log('Comments:', data);
      
      const comments = data.comments || [];
      
      if (comments.length === 0) {
        commentsList.innerHTML = '<p class="msg">No comments yet. Be the first to comment!</p>';
        return;
      }
      
      commentsList.innerHTML = '';
      comments.forEach(comment => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        const date = new Date(comment.createdAt).toLocaleDateString();
        
        commentDiv.innerHTML = `
          <div class="comment-author">${comment.userName || 'Anonymous'}</div>
          <div class="comment-content">${comment.content || ''}</div>
          <div class="comment-date">${date}</div>
        `;
        
        commentsList.appendChild(commentDiv);
      });
      
    } catch (err) {
      console.error('Error loading comments:', err);
      commentsList.innerHTML = '<p class="msg">Failed to load comments.</p>';
    }
  }

  // Post comment
  document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const commentContent = document.getElementById('commentContent');
    const commentMsg = document.getElementById('commentMsg');
    const content = commentContent.value.trim();
    
    if (!content) {
      commentMsg.textContent = 'Please enter a comment.';
      return;
    }
    
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('displayName') || localStorage.getItem('username') || 'Anonymous';
    
    if (!userId) {
      commentMsg.textContent = 'Please login to comment.';
      return;
    }
    
    try {
      commentMsg.textContent = 'Posting...';
      
      const res = await fetch(ADD_COMMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dishId: dishId,
          userId: userId,
          userName: userName,
          content: content
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to post comment');
      }
      
      const data = await res.json();
      console.log('Comment posted:', data);
      
      // Clear form and reload comments
      commentContent.value = '';
      commentMsg.textContent = 'Comment posted successfully!';
      setTimeout(() => {
        commentMsg.textContent = '';
      }, 3000);
      
      loadComments();
      
    } catch (err) {
      console.error('Error posting comment:', err);
      commentMsg.textContent = 'Failed to post comment. Please try again.';
    }
  });

  // Check if current user owns this dish
  function checkOwnership(dishUserId) {
    const currentUserId = localStorage.getItem('userId');
    const dishActions = document.getElementById('dishActions');
    
    if (currentUserId && currentUserId === dishUserId) {
      dishActions.classList.remove('hidden');
    }
  }

  // Edit dish functionality
  const editModal = document.getElementById('editModal');
  const editBtn = document.getElementById('editBtn');
  const cancelEdit = document.getElementById('cancelEdit');
  const editForm = document.getElementById('editForm');
  const editImageInput = document.getElementById('editImage');
  const editFileLabel = document.getElementById('editFileLabel');
  const editImagePreview = document.getElementById('editImagePreview');
  const editPreviewImg = document.getElementById('editPreviewImg');
  
  // Image preview for edit modal
  if (editImageInput) {
    editImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Update file label
        editFileLabel.textContent = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
          editPreviewImg.src = e.target.result;
          editImagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      } else {
        editFileLabel.textContent = 'Choose New Image';
        editImagePreview.classList.add('hidden');
      }
    });
  }
  
  editBtn.addEventListener('click', () => {
    if (!currentDish) return;
    
    // Parse tags for display
    let tags = currentDish.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [];
      }
    }
    
    // Populate form
    document.getElementById('editTitle').value = currentDish.title || '';
    document.getElementById('editDescription').value = currentDish.description || '';
    document.getElementById('editCuisine').value = currentDish.cuisine || '';
    document.getElementById('editTags').value = Array.isArray(tags) ? tags.join(', ') : '';
    
    // Show modal
    editModal.classList.remove('hidden');
  });
  
  cancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    document.getElementById('editMsg').textContent = '';
  });
  
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const editMsg = document.getElementById('editMsg');
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      editMsg.textContent = 'Please login to edit.';
      return;
    }
    
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const cuisine = document.getElementById('editCuisine').value.trim();
    const tagsInput = document.getElementById('editTags').value.trim();
    const imageInput = document.getElementById('editImage');
    
    // Convert tags to array
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    try {
      editMsg.textContent = 'Updating...';
      
      let updatePayload = {
        id: dishId,
        userId: userId,
        title: title,
        description: description,
        cuisine: cuisine,
        tags: tags
      };
      
      // If user selected a new image, we need to re-upload the entire dish
      if (imageInput.files && imageInput.files[0]) {
        editMsg.textContent = 'Uploading new image...';
        
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // Delete old dish first
        editMsg.textContent = 'Removing old version...';
        const deleteUrl = `${DELETE_DISH_URL}&id=${encodeURIComponent(dishId)}&userId=${encodeURIComponent(userId)}`;
        const deleteRes = await fetch(deleteUrl, {
          method: 'DELETE'
        });
        if (!deleteRes.ok) {
          console.warn('Failed to delete old dish, continuing anyway...');
        }
        
        // Upload new dish with new image
        editMsg.textContent = 'Uploading dish with new image...';
        const userName = localStorage.getItem('displayName') || localStorage.getItem('username') || 'User';
        const uploadRes = await fetch(UPLOAD_DISH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageContent: base64,
            imageType: file.type || 'image/jpeg',
            userId: userId,
            userName: userName,
            title: title,
            description: description,
            cuisine: cuisine,
            tags: tags
          })
        });
        
        if (!uploadRes.ok) {
          throw new Error('Failed to upload dish with new image');
        }
        
        const uploadData = await uploadRes.json();
        console.log('Dish re-uploaded with new image:', uploadData);
        
        editMsg.textContent = 'Updated successfully! Reloading...';
        
        // Get new dish ID and reload to show updated dish
        const newDishId = uploadData.dishId || uploadData.id;
        setTimeout(() => {
          if (newDishId && newDishId !== dishId) {
            // Redirect to new dish detail page
            location.href = `detail.html?id=${encodeURIComponent(newDishId)}`;
          } else {
            // Just reload current page
            location.reload();
          }
        }, 1000);
        
        return; // Exit early, no need to continue with normal update
      }
      
      // Update dish information
      const res = await fetch(UPDATE_DISH_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (!res.ok) {
        throw new Error('Failed to update dish');
      }
      
      const data = await res.json();
      console.log('Dish updated:', data);
      
      editMsg.textContent = 'Updated successfully! Reloading...';
      
      // Reload page after short delay
      setTimeout(() => {
        location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('Error updating dish:', err);
      editMsg.textContent = 'Failed to update dish. Please try again.';
    }
  });

  // Delete dish functionality
  const deleteBtn = document.getElementById('deleteBtn');
  
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this dish? This action cannot be undone.')) {
      return;
    }
    
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert('Please login to delete.');
      return;
    }
    
    try {
      const url = `${DELETE_DISH_URL}&id=${encodeURIComponent(dishId)}&userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete dish');
      }
      
      const data = await res.json();
      console.log('Dish deleted:', data);
      
      alert('Dish deleted successfully!');
      
      // Redirect to gallery
      window.location.href = 'gallery.html';
      
    } catch (err) {
      console.error('Error deleting dish:', err);
      alert('Failed to delete dish. Please try again.');
    }
  });

  // Initialize
  loadDishDetail();
  loadComments();
})();

