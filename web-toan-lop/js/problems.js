function previewProblemImage(){
  const input=$("problemImage");
  const box=$("imagePreview");

  box.innerHTML="";

  const file=input.files[0];

  if(!file)return;

  if(![
    "image/jpeg",
    "image/png",
    "image/webp"
  ].includes(file.type)){
    alert("❌ Chỉ hỗ trợ JPG, PNG hoặc WEBP.");
    input.value="";
    return;
  }

  if(file.size>5*1024*1024){
    alert("❌ Hình ảnh tối đa 5MB.");
    input.value="";
    return;
  }

  const preview=document.createElement("div");

  preview.className="previewBox";

  preview.innerHTML=
    `🖼️ <b>${esc(file.name)}</b>`;

  const img=document.createElement("img");

  img.className="previewImage";

  img.src=URL.createObjectURL(file);

  preview.appendChild(img);

  box.appendChild(preview);
}

function previewProblemFile(){
  const input=$("problemFile");
  const box=$("filePreview");

  box.innerHTML="";

  const file=input.files[0];

  if(!file)return;

  const allowed=[
    ".pdf",".doc",".docx",
    ".xls",".xlsx",
    ".ppt",".pptx",".txt"
  ];

  const name=file.name.toLowerCase();

  const valid=allowed.some(
    ext=>name.endsWith(ext)
  );

  if(!valid){
    alert(
      "❌ Loại file này không được hỗ trợ."
    );
    input.value="";
    return;
  }

  if(file.size>10*1024*1024){
    alert("❌ File tối đa 10MB.");
    input.value="";
    return;
  }

  box.innerHTML=`
    <div class="previewBox">
      📎 <b>${esc(file.name)}</b>

      <span class="small">
        (
        ${(file.size/1024/1024).toFixed(2)}
        MB
        )
      </span>
    </div>
  `;
}

async function uploadProblemFile(
  file,
  folder,
  maxSize
){
  if(!file)return null;

  if(file.size>maxSize){
    throw new Error(
      `${file.name} vượt quá dung lượng cho phép.`
    );
  }

  if(
    !CLOUDINARY_CLOUD_NAME||
    CLOUDINARY_CLOUD_NAME==="YOUR_CLOUD_NAME"
  ){
    throw new Error(
      "Chưa cài Cloudinary Cloud Name."
    );
  }

  if(
    !CLOUDINARY_UPLOAD_PRESET||
    CLOUDINARY_UPLOAD_PRESET==="YOUR_UPLOAD_PRESET"
  ){
    throw new Error(
      "Chưa cài Cloudinary Upload Preset."
    );
  }

  const progress=$("uploadProgress");

  if(progress){
    progress.textContent=
      `☁️ Đang tải ${file.name} lên Cloudinary...`;
  }

  const formData=new FormData();

  formData.append("file",file);

  formData.append(
    "upload_preset",
    CLOUDINARY_UPLOAD_PRESET
  );

  formData.append(
    "folder",
    `web-toan-lop/${folder}`
  );

  try{
    const response=await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method:"POST",
        body:formData
      }
    );

    const data=await response.json();

    if(!response.ok){
      console.error(
        "Cloudinary error:",
        data
      );

      throw new Error(
        data?.error?.message||
        "Cloudinary upload thất bại."
      );
    }

    if(!data.secure_url){
      throw new Error(
        "Cloudinary không trả về URL file."
      );
    }

    if(progress){
      progress.textContent=
        `✅ Đã tải ${file.name} lên Cloudinary`;
    }

    return {
      name:file.name,
      url:data.secure_url,
      size:file.size,
      type:file.type||"",
      publicId:data.public_id||"",
      resourceType:data.resource_type||"auto"
    };

  }catch(error){
    console.error(
      "Lỗi upload Cloudinary:",
      error
    );

    if(progress){
      progress.textContent=
        `❌ Upload thất bại: ${file.name}`;
    }

    throw error;
  }
}

async function postProblem(){
  if(!currentUser){
    alert("Bạn cần đăng nhập trước.");
    return;
  }

  const input=$("problemInput");
  const classInput=$("classInput");
  const imageInput=$("problemImage");
  const fileInput=$("problemFile");
  const button=$("postProblemBtn");
  const progress=$("uploadProgress");

  const text=input.value.trim();
  const lop=classInput.value;

  const image=imageInput.files[0]||null;
  const file=fileInput.files[0]||null;

  if(!text&&!image&&!file){
    alert(
      "Hãy nhập đề toán hoặc thêm hình ảnh/file."
    );
    return;
  }

  if(text.length>1000){
    alert("Đề toán tối đa 1000 ký tự.");
    return;
  }

  if(image){
    if(![
      "image/jpeg",
      "image/png",
      "image/webp"
    ].includes(image.type)){
      alert("❌ Hình ảnh không hợp lệ.");
      return;
    }

    if(image.size>5*1024*1024){
      alert("❌ Hình ảnh tối đa 5MB.");
      return;
    }
  }

  if(file){
    const allowed=[
      ".pdf",".doc",".docx",
      ".xls",".xlsx",
      ".ppt",".pptx",".txt"
    ];

    const fileName=
      file.name.toLowerCase();

    const valid=allowed.some(
      ext=>fileName.endsWith(ext)
    );

    if(!valid){
      alert(
        "❌ Loại file này không được hỗ trợ."
      );
      return;
    }

    if(file.size>10*1024*1024){
      alert("❌ File tối đa 10MB.");
      return;
    }
  }

  button.disabled=true;

  progress.textContent=
    "Đang chuẩn bị đăng bài...";

  let problemRef=null;

  try{
    problemRef=db.ref(
      "danhSachDe"
    ).push();

    const problemId=problemRef.key;

    let imageData=null;
    let fileData=null;

    if(image){
      progress.textContent=
        "🖼️ Đang tải hình ảnh lên Cloudinary...";

      imageData=
        await uploadProblemFile(
          image,
          `${problemId}/images`,
          5*1024*1024
        );
    }

    if(file){
      progress.textContent=
        "📎 Đang tải file lên Cloudinary...";

      fileData=
        await uploadProblemFile(
          file,
          `${problemId}/files`,
          10*1024*1024
        );
    }

    await problemRef.set({
      uid:currentUser.uid,
      tenNguoiDang:
        profile.ten||"Học sinh",
      lop:lop,
      noiDung:text,
      thoiGian:
        firebase.database.ServerValue.TIMESTAMP,
      hinhAnh:imageData,
      tepDinhKem:fileData
    });

    await addXP(10);

    await incrementStat("soDeDang");

    input.value="";
    classInput.value="";
    imageInput.value="";
    fileInput.value="";

    $("imagePreview").innerHTML="";
    $("filePreview").innerHTML="";

    progress.textContent="";

    alert(
      "🎉 Đăng đề thành công! +10 XP"
    );

  }catch(e){
    console.error(
      "Lỗi đăng đề:",
      e
    );

    alert(
      "❌ Không đăng được: "+
      e.message
    );

    progress.textContent=
      "❌ Tải lên thất bại.";

  }finally{
    button.disabled=false;
  }
}

db.ref("danhSachDe")
  .limitToLast(40)
  .on("value",snap=>{
    const arr=[];

    snap.forEach(child=>{
      const data=child.val()||{};

      data.key=child.key;

      arr.push(data);
    });

    arr.reverse();

    renderFilters(arr);
    renderProblems(arr);
  });

function renderFilters(arr){
  const values=[
    "",
    ...new Set(
      arr
        .map(x=>x.lop)
        .filter(Boolean)
    )
  ];

  const box=$("filters");

  box.innerHTML="";

  values.forEach(value=>{
    const button=
      document.createElement("button");

    button.textContent=
      value||"Tất cả";

    if(value===selectedClass)
      button.classList.add("active");

    button.onclick=()=>{
      selectedClass=value;
      renderFilters(arr);
      renderProblems(arr);
    };

    box.appendChild(button);
  });
}

function renderProblems(arr){
  const box=$("problems");

  box.innerHTML="";

  const list=arr.filter(
    x=>
      !selectedClass||
      x.lop===selectedClass
  );

  if(!list.length){
    box.innerHTML=
      `<div class="card loading">
        Chưa có đề.
      </div>`;
    return;
  }

  list.forEach(data=>{
    const div=document.createElement("div");

    div.className="problem";

    div.innerHTML=`
      <div>
        <b>
          ${esc(
            data.tenNguoiDang||
            "Học sinh"
          )}
        </b>

        ${
          data.lop
            ? `<span class="tag">
                ${esc(data.lop)}
              </span>`
            : ""
        }
      </div>

      <div class="small">
        ${
          data.thoiGian
            ? new Date(data.thoiGian)
              .toLocaleString("vi-VN")
            : ""
        }
      </div>

      ${
        data.noiDung
          ? `<div class="problemText">
              ${esc(data.noiDung)}
            </div>`
          : ""
      }

      ${
        data.hinhAnh?.url
          ? `<div class="attachment">
              🖼️ <b>Hình ảnh</b>

              <img
                class="problemImage"
                src="${esc(data.hinhAnh.url)}"
                alt="Hình ảnh bài toán"
                loading="lazy"
              >
            </div>`
          : ""
      }

      ${
        data.tepDinhKem?.url
          ? `<div class="attachment fileAttachment">
              📎

              <a
                href="${esc(data.tepDinhKem.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${esc(
                  data.tepDinhKem.name||
                  "Mở file"
                )}
              </a>

              <span class="small">
                ${
                  data.tepDinhKem.size
                    ? `(${(
                        data.tepDinhKem.size/
                        1024/
                        1024
                      ).toFixed(2)} MB)`
                    : ""
                }
              </span>
            </div>`
          : ""
      }

      <div id="comments-${data.key}">
        <span class="small">
          Đang tải bình luận...
        </span>
      </div>

      <input
        id="comment-${data.key}"
        maxlength="300"
        placeholder="Viết bình luận..."
      >

      <div class="btnrow">
        <button
          onclick="commentProblem('${data.key}')"
        >
          💬 Bình luận
        </button>

        <button
          class="green"
          onclick="markSolved('${data.key}')"
        >
          ✅ Đã giải
        </button>
      </div>
    `;

    box.appendChild(div);

    loadComments(data.key);
  });
}

function loadComments(key){
  db.ref(
    `danhSachDe/${key}/binhLuan`
  )
  .limitToLast(20)
  .once("value",snap=>{
    const box=$("comments-"+key);

    if(!box)return;

    box.innerHTML="";

    if(!snap.exists()){
      box.innerHTML=
        `<span class="small">
          Chưa có bình luận.
        </span>`;
      return;
    }

    snap.forEach(child=>{
      const data=child.val()||{};

      const div=document.createElement("div");

      div.className="comment";

      div.innerHTML=`
        <b>
          ${esc(data.ten||"Học sinh")}
        </b>:

        ${esc(data.noiDung)}
      `;

      box.appendChild(div);
    });
  });
}

async function commentProblem(key){
  if(!currentUser)return;

  const input=$("comment-"+key);

  if(!input)return;

  const text=input.value.trim();

  if(!text)return;

  if(text.length>300){
    alert(
      "Bình luận tối đa 300 ký tự."
    );
    return;
  }

  try{
    await db.ref(
      `danhSachDe/${key}/binhLuan`
    ).push({
      uid:currentUser.uid,
      ten:profile.ten||"Học sinh",
      noiDung:text,
      thoiGian:
        firebase.database.ServerValue.TIMESTAMP
    });

    input.value="";

    loadComments(key);

  }catch(e){
    alert(
      "Không bình luận được: "+
      e.message
    );
  }
}

async function markSolved(key){
  if(!currentUser)return;

  const ref=db.ref(
    `danhSachDe/${key}/daGiai/${currentUser.uid}`
  );

  try{
    const result=await ref.transaction(old=>{
      if(old!==null)return;

      return {
        ten:profile.ten||"Học sinh",
        thoiGian:
          firebase.database.ServerValue.TIMESTAMP
      };
    });

    if(!result.committed){
      alert(
        "⚠️ Bạn đã đánh dấu bài này rồi."
      );
      return;
    }

    await addXP(2);

    alert(
      "✅ Đã ghi nhận! +2 XP"
    );

  }catch(e){
    alert(
      "❌ Không thể ghi nhận: "+
      e.message
    );
  }
}