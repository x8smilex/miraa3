// Đường dẫn URL API Web App từ Google Apps Script của bạn
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzIWl3hwZSk8tlFj7gxiYJCbXuE9pACNgHJ9ahufLkvuZEfYNqphhbI2lLfZY5Zb8grtg/exec";

// Khởi tạo biến lưu trữ dữ liệu toàn cục
let albumData = [];
let currentIndex = 0;
let rotationInterval;

// Dữ liệu mẫu câu chúc (Nếu bạn có API lời chúc từ Google Sheet, hãy fetch động tương tự như ảnh)
const sampleWishes = [
    { name: "Bạn Minh & Thảo", text: "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long nhé!" },
    { name: "Anh Hoàng (Đồng nghiệp)", text: "Happy Wedding! Chúc gia đình nhỏ luôn ngập tràn tiếng cười và niềm vui." },
    { name: "Chị Linh Nguyễn", text: "Mãi bên nhau hạnh phúc viên mãn như ngày đầu tiên nha hai bạn mình." },
    { name: "Gia đình Bác Ba", text: "Chúc hai cháu có một hành trình mới thật nhiều may mắn, tài lộc và hạnh phúc." },
    { name: "Nhóm bạn Đại học", text: "Cưới thôi đợi mãi! Chúc mừng ngày vui trọng đại của cặp đôi đẹp nhất năm!" },
    { name: "Pé Bảy", text: "Chúc album hình luôn lung linh, cô dâu chú rể luôn giữ trọn nụ cười này!" }
];

// Hàm chạy khi trang web tải xong
window.addEventListener("DOMContentLoaded", () => {
    loadWishes();
    fetchAlbumData();
});

// 1. Hàm nạp danh sách lời chúc vào cột chạy chữ
function loadWishes() {
    const container = document.getElementById("wishesContainer");
    container.innerHTML = "";
    
    // Nhân đôi danh sách lời chúc để tạo hiệu ứng cuộn vô tận mượt mà hơn
    const doubleWishes = [...sampleWishes, ...sampleWishes];
    
    doubleWishes.forEach(wish => {
        const item = document.createElement("div");
        item.className = "wish-item";
        item.innerHTML = `
            <div class="wish-user"><i class="fa-regular fa-user" style="color:#e91e63; font-size:12px;"></i> ${wish.name}</div>
            <div class="wish-text">${wish.text}</div>
        `;
        container.appendChild(item);
    });
}

// 2. Gọi API lấy dữ liệu ảnh từ Google Apps Script
function fetchAlbumData() {
    if(APPS_SCRIPT_URL.includes("VUI_LONG_THAY_URL")) {
        console.warn("Vui lòng cập nhật URL Web App Apps Script thực tế của bạn.");
        return;
    }

    fetch(APPS_SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            albumData = data; // Lưu mảng chứa cấu trúc [{id: "...", category: "...", region: "..."}, ...]
            if (albumData && albumData.length > 0) {
                displayImageAtIndex(0);
                startImageRotation();
            } else {
                document.getElementById("placeholderText").innerText = "Thư mục hiện tại không có ảnh nào.";
            }
        })
        .catch(error => {
            console.error("Lỗi lấy dữ liệu từ Apps Script:", error);
            document.getElementById("placeholderText").innerText = "Không thể tải ảnh. Vui lòng kiểm tra cấu hình chia sẻ thư mục Drive.";
        });
}

// 3. Hàm hiển thị ảnh lớn tại một vị trí index xác định
function displayImageAtIndex(index) {
    if (!albumData || albumData.length === 0) return;
    
    const imgElement = document.getElementById("mainBigImage");
    const placeholder = document.getElementById("placeholderText");
    
    // Đảm bảo index vòng lặp chuẩn xác
    if (index >= albumData.length) currentIndex = 0;
    if (index < 0) currentIndex = albumData.length - 1;
    
    // SỬ DỤNG ENDPOINT THUMBNAIL sz=s0 GIÚP TRANH LỖI COOKIE 403 GOOGLE DRIVE
    const fileId = albumData[currentIndex].id;
    const secureImageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=s0`;
    
    imgElement.src = secureImageUrl;
    imgElement.style.display = "inline-block";
    placeholder.style.display = "none";
}

// 4. Cơ chế tự động chuyển đổi ảnh lớn sau mỗi 5 giây
function startImageRotation() {
    clearInterval(rotationInterval);
    rotationInterval = setInterval(() => {
        currentIndex++;
        if (albumData.length > 0) {
            displayImageAtIndex(currentIndex);
        }
    }, 5000); 
}

// 5. Hàm xử lý bộ lọc (Phân loại theo Danh mục / Khu vực)
function filterAlbum() {
    const selectedCat = document.getElementById("categorySelect").value;
    const selectedReg = document.getElementById("regionSelect").value;
    
    // Logic gửi tham số filter lên Apps Script hoặc filter trực tiếp dưới Client tùy cấu hình của bạn
    console.log(`Đang lọc theo: Danh mục = ${selectedCat} | Khu vực = ${selectedReg}`);
    
    // Ví dụ filter client-side nếu dữ liệu trả về của bạn có chứa trường category/region:
    /*
    const filtered = albumData.filter(item => {
        const matchCat = (selectedCat === 'all' || item.category === selectedCat);
        const matchReg = (selectedReg === 'all' || item.region === selectedReg);
        return matchCat && matchReg;
    });
    */
}
