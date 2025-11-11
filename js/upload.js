// Upload dish
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const fileLabel = document.getElementById('fileLabel');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Image preview functionality
if (imageInput) {
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update file label
      fileLabel.textContent = file.name;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      fileLabel.textContent = 'Choose Image File';
      imagePreview.classList.add('hidden');
    }
  });
}

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('uploadMsg');
    msg.textContent = 'Uploading...';
    const file = document.getElementById('imageInput').files[0];
    if (!file) { msg.textContent = 'Please choose an image.'; return; }
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const cuisine = document.getElementById('cuisine').value.trim();
    const tags = document.getElementById('tags').value.split(',').map(s => s.trim()).filter(Boolean);
    const userId = localStorage.getItem('userId') || '';
    const userName = localStorage.getItem('displayName') || localStorage.getItem('username') || 'User';

    // Convert to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const payload = {
      imageContent: base64,
      imageType: file.type || 'image/jpeg',
      title, description, cuisine, tags, userId, userName
    };

    const res = await fetch(UPLOAD_DISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      msg.textContent = 'Upload failed.';
      return;
    }
    const data = await res.json();
    
    // Track dish upload event
    if (window.trackEvent) {
      window.trackEvent('DishUploaded', {
        cuisine: cuisine,
        tags: tags.join(', '),
        userId: userId
      });
    }
    
    // Track cuisine category metric
    if (cuisine && window.trackMetric) {
      window.trackMetric('DishUploadByCuisine', 1, { cuisine: cuisine });
    }
    
    msg.textContent = 'Upload successful.';
    // Redirect to detail if available
    if (data.dishId || data.id) {
      const id = data.dishId || data.id;
      location.href = `detail.html?id=${encodeURIComponent(id)}`;
    }
  });
}


