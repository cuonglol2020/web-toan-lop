function sendChat(){
  if(!currentUser)return;

  const input=$("chatInput");

  const text=input.value.trim();

  if(!text)return;

  if(text.length>300){
    alert(
      "Tin nhắn tối đa 300 ký tự."
    );
    return;
  }

  db.ref("chatChung").push({
    uid:currentUser.uid,
    ten:profile.ten||"Học sinh",
    noiDung:text,
    thoiGian:
      firebase.database.ServerValue.TIMESTAMP
  })
  .then(()=>{
    input.value="";
  })
  .catch(e=>{
    alert(
      "Không gửi được: "+
      e.message
    );
  });
}

db.ref("chatChung")
  .limitToLast(50)
  .on("value",snap=>{
    const box=$("chat");

    box.innerHTML="";

    if(!snap.exists()){
      box.innerHTML=
        `<div class="loading">
          Chưa có tin nhắn.
        </div>`;
      return;
    }

    snap.forEach(child=>{
      const data=child.val()||{};

      const div=document.createElement("div");

      div.className="msg";

      div.innerHTML=`
        <div class="msghead">
          <span class="msgAvatar"></span>

          <b>
            ${esc(data.ten||"Học sinh")}
          </b>

          <span class="time">
            ${
              data.thoiGian
                ? new Date(data.thoiGian)
                  .toLocaleTimeString(
                    "vi-VN",
                    {
                      hour:"2-digit",
                      minute:"2-digit"
                    }
                  )
                : ""
            }
          </span>
        </div>

        <div style="margin-top:4px">
          ${esc(data.noiDung)}
        </div>
      `;

      box.appendChild(div);

      div.querySelector(".msgAvatar")
        .appendChild(
          makeAvatar(data.ten)
        );
    });

    box.scrollTop=box.scrollHeight;
  });

db.ref("nguoiDung")
  .orderByChild("xp")
  .limitToLast(10)
  .on("value",snap=>{
    const users=[];

    snap.forEach(child=>{
      users.push(child.val()||{});
    });

    users.reverse();

    const box=$("leaderboard");

    box.innerHTML="";

    users.forEach((u,index)=>{
      const li=document.createElement("li");

      const medal=
        index===0
          ? "🥇"
          : index===1
            ? "🥈"
            : index===2
              ? "🥉"
              : `${index+1}.`;

      li.innerHTML=`
        ${medal}

        <b>
          ${esc(u.ten||"Ẩn danh")}
        </b>

        — ${Number(u.xp)||0} XP

        <span class="badge">
          Lv.${getLevelInfo(u.xp).level}
        </span>
      `;

      li.style.padding="7px";

      box.appendChild(li);
    });

    if(!users.length){
      box.innerHTML=
        "<li>Chưa có dữ liệu.</li>";
    }
  });