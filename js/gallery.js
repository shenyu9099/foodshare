// Load gallery with optional filters
(function initGallery(){
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const msg = document.getElementById('galleryMsg');
  const searchEl = document.getElementById('filterSearch');
  const tagsEl = document.getElementById('filterTags');
  const applyBtn = document.getElementById('applyFilters');

  async function load() {
    msg.textContent = 'Loading...';
    
    // Track page load time
    const loadStartTime = performance.now();
    
    // For now, just load all dishes (filters will be applied client-side)
    const base = (typeof LIST_DISHES_URL !== 'undefined') ? LIST_DISHES_URL : (API_BASE + '/get-dishes');
    // LIST_DISHES_URL already has query params, so use & for limit
    const sep = base.includes('?') ? '&' : '?';
    const url = `${base}${sep}limit=50`;
    
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      console.error('Fetch error:', err);
      msg.textContent = 'Network error. Please try again.';
      return;
    }
    if (!res.ok) {
      msg.textContent = 'Failed to load gallery.';
      return;
    }
    const data = await res.json();
    console.log('Raw data:', data);
    let items = data.items || data.dishes || data || [];
    console.log('Items count:', items.length);
    
    // Normalize data: parse tags if it's a string
    items = items.map(d => {
      if (typeof d.tags === 'string') {
        try {
          d.tags = JSON.parse(d.tags);
        } catch (e) {
          d.tags = [];
        }
      }
      return d;
    });
    
    // Apply client-side filters (fuzzy search)
    const searchKeyword = searchEl.value.trim().toLowerCase();
    const tagsFilter = tagsEl.value.trim().toLowerCase();
    
    // Search in title and description
    if (searchKeyword) {
      items = items.filter(d => 
        (d.title || '').toLowerCase().includes(searchKeyword) ||
        (d.description || '').toLowerCase().includes(searchKeyword) ||
        (d.cuisine || '').toLowerCase().includes(searchKeyword)
      );
    }
    
    // Filter by tags
    if (tagsFilter) {
      const filterTags = tagsFilter.split(',').map(t => t.trim()).filter(t => t);
      items = items.filter(d => {
        const dishTags = Array.isArray(d.tags) ? d.tags.map(t => t.toLowerCase()) : [];
        // Fuzzy search: match if any tag contains any filter keyword
        return filterTags.some(ft => dishTags.some(dt => dt.includes(ft)));
      });
    }
    
    grid.innerHTML = '';
    if (!items.length) {
      msg.textContent = 'No dishes found.';
      console.log('No items after filtering');
      return;
    }
    msg.textContent = '';
    console.log('Rendering', items.length, 'items');
    items.forEach(d => {
      const card = document.createElement('a');
      card.href = `detail.html?id=${encodeURIComponent(d.id)}`;
      card.className = 'card';
      
      // Fix image URL: if it's relative path, prepend blob storage base URL
      let imgUrl = d.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
      if (imgUrl.startsWith('/')) {
        imgUrl = (typeof BLOB_BASE_URL !== 'undefined' ? BLOB_BASE_URL : '') + imgUrl;
        // Append SAS token if available
        if (typeof BLOB_SAS_TOKEN !== 'undefined' && BLOB_SAS_TOKEN) {
          imgUrl += BLOB_SAS_TOKEN;
        }
      }
      
      card.innerHTML = `
        <img src="${imgUrl}" alt="${d.title || 'Dish image'}">
        <div class="body">
          <div class="title">${d.title || 'Untitled'}</div>
          <div class="meta">${(d.cuisine||'').toString()} · ${(d.tags||[]).slice(0,3).join(', ')}</div>
        </div>
      `;
      grid.appendChild(card);
    });
    
    // Track page load performance
    const loadEndTime = performance.now();
    const loadTime = loadEndTime - loadStartTime;
    if (window.trackMetric) {
      window.trackMetric('GalleryLoadTime', loadTime, { itemCount: items.length });
    }
    
    // Track filter usage if filters were applied
    const searchValue = searchEl?.value?.trim();
    const tagsValue = tagsEl?.value?.trim();
    if ((searchValue || tagsValue) && window.trackEvent) {
      window.trackEvent('GalleryFiltered', {
        search: searchValue || '',
        tags: tagsValue || '',
        resultCount: items.length
      });
    }
  }

  applyBtn.addEventListener('click', () => {
    // Track filter button click
    if (window.trackEvent) {
      const searchValue = searchEl?.value?.trim();
      const tagsValue = tagsEl?.value?.trim();
      window.trackEvent('FilterApplied', {
        hasSearch: !!searchValue,
        hasTags: !!tagsValue
      });
    }
    load();
  });
  
  load();
})();


