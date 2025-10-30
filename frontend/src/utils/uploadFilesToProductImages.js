// // src/utils/uploadFilesToProductImages.js
// export async function uploadFilesToProductImages(productId, files = [], token) {
//   if (!files || files.length === 0)
//     return { success: true, data: null, message: "No new files to upload" };

//   const formData = new FormData();
//   files.forEach((file) => formData.append("images", file));

//   const headers = {};
//   if (token) headers["Authorization"] = `Bearer ${token}`;

//   try {
//     const res = await fetch(`/api/products/${productId}/images`, {
//       method: "POST",
//       headers,
//       body: formData,
//     });

//     const json = await res.json();
//     if (!res.ok) throw new Error(json.message || "Upload failed");
//     return { success: true, data: json.data, message: json.message };
//   } catch (err) {
//     console.error("Upload error:", err);
//     return { success: false, message: err.message };
//   }
// }
