// API base - default for other endpoints
// Example: const API_BASE = "https://<logicapp>.azurewebsites.net/api";
const API_BASE = "/api";

// Explicit Logic Apps endpoints (provided)
const REGISTER_URL = "https://prod-07.francecentral.logic.azure.com:443/workflows/c43cb35b3b454939a78e016145183d8b/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=LqHua2llccEbVe4QMEybFcokhYvJWpASNnSLmM_UoOs";
const LOGIN_URL = "https://prod-29.francecentral.logic.azure.com:443/workflows/9622d40d917b4182ba6ac10731c6371f/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=SqCKOOugtTgxLCeRYn03R6zt0GaCgDWEzvShpmaO7AE";
const UPLOAD_DISH_URL = "https://prod-20.francecentral.logic.azure.com:443/workflows/82ba113234c24653af67ef72fbd1d323/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=QdMoN4g6SzkAUbstBtx-GWP2C9o6G0y2mpfEJKNDFRI";
const LIST_DISHES_URL = "https://prod-27.francecentral.logic.azure.com:443/workflows/15ab4ba580734685a5a8c81d6a7b3fde/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=tu4eQr0yLScWMcLiRqk_Yo5WT3xCwOs5PQcSvViNkdY";
const GET_DISH_BY_ID_URL = "https://prod-24.francecentral.logic.azure.com:443/workflows/76c9e7493ea14ef5ac69ca86c2238f56/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=wYoMyRLSW9jRJ44HX_VzayKK3LhG_uEhtiHMwSQblBE";
const ADD_COMMENT_URL = "https://prod-20.francecentral.logic.azure.com:443/workflows/6164f45712004a0ca7030d9236e72bac/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=3U_3SqLIB4tlXONcoW_udZQPk4QNr1gHVfR41cT8le0";
const GET_COMMENTS_URL = "https://prod-09.francecentral.logic.azure.com:443/workflows/cddc95719ab3469bbede8c36a601a24a/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=GOqHFnrDhaS7Wq-WC5I_mSSDjXeUw-C-VvgS6MzV558";
const UPDATE_DISH_URL = "https://prod-01.francecentral.logic.azure.com:443/workflows/86f26e19205a48f9801a7a87d0d5785e/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=OwGSZYR72IkdqO--ciiX6LYRxLPBKJX4Jg1HLQdcbQs";
const DELETE_DISH_URL = "https://prod-11.francecentral.logic.azure.com:443/workflows/636a2a64aaa340518dbb07f7c119e25f/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=wZsrA-2Gan3Je6MOS_kRprBXBfmNYFSkPGtKfqgvzV8";

// Blob Storage base URL
const BLOB_BASE_URL = "https://foodsharestor2025.blob.core.windows.net";
// Blob SAS Token (如果容器不是公开的，需要添加 SAS token)
// 从 Azure Portal → Storage Account → Shared access signature 生成
const BLOB_SAS_TOKEN = ""; // 例如: "?sv=2022-11-02&ss=b&srt=o&sp=r&se=2026-11-11..."

// Simple auth UI state
(function syncAuthUI(){
  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const userDisplay = document.getElementById('userDisplay');
  const username = localStorage.getItem('username');
  const displayName = localStorage.getItem('displayName');
  
  if ((username || displayName) && logoutBtn) {
    // Hide login/register links
    if (loginLink) loginLink.classList.add('hidden');
    if (registerLink) registerLink.classList.add('hidden');
    
    // Show logout button
    logoutBtn.classList.remove('hidden');
    logoutBtn.onclick = () => {
      localStorage.clear();
      location.reload();
    };
    
    // Show username in nav (if userDisplay element exists)
    if (userDisplay) {
      userDisplay.textContent = displayName || username;
      userDisplay.classList.remove('hidden');
    }
  }
})();


