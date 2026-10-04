function renderXP(){
  const xp=Number(profile?.xp)||0;
  const info=getLevelInfo(xp);

  $("xp").textContent=xp+" XP";

  $("level").innerHTML=
    `<span class="badge">Lv.${info.level}</span>`;

  $("xpprogress").textContent=
    `${info.remain}/${info.required} XP`;

  $("xpfill").style.width=
    Math.min(
      100,
      info.remain/info.required*100
    )+"%";

  const badges=[];

  if((stats.soDeDang||0)>=10)
    badges.push("📚");

  if((stats.soTranThang||0)>=5)
    badges.push("⚔️");

  if(getStreak()>=7)
    badges.push("🔥");

  $("badges").textContent=
    badges.length
      ? badges.join(" ")
      : "Chưa có";
}

async function loadUser(){
  if(!currentUser)return;

  db.ref(
    "nguoiDung/"+currentUser.uid
  ).on("value",snap=>{
    profile=snap.val()||{};

    $("name").textContent=
      profile.ten||"Học sinh";

    const avatarBox=$("avatar");

    avatarBox.innerHTML="";

    avatarBox.appendChild(
      makeAvatar(profile.ten)
    );

    renderXP();
    renderStreak();
  });

  db.ref(
    "thongKe/"+currentUser.uid
  ).on("value",snap=>{
    stats=snap.val()||{};
    renderXP();
  });

  loadHistory();
}

async function addXP(amount){
  if(
    !currentUser||
    !Number.isFinite(amount)||
    amount<=0
  )
    return false;

  const safe=Math.min(
    10,
    Math.floor(amount)
  );

  const ref=db.ref(
    "nguoiDung/"+currentUser.uid
  );

  const result=await ref.transaction(user=>{
    if(!user)return user;

    const oldXP=Number(user.xp)||0;

    const newXP=oldXP+safe;

    user.xp=newXP;

    user.level=
      getLevelInfo(newXP).level;

    return user;
  });

  return result.committed;
}

async function incrementStat(key){
  if(!currentUser)return;

  const ref=db.ref(
    `thongKe/${currentUser.uid}`
  );

  const result=await ref.transaction(old=>{
    old=old||{};

    old.soDeDang=
      Number(old.soDeDang)||0;

    old.soTranThang=
      Number(old.soTranThang)||0;

    old.soTranThua=
      Number(old.soTranThua)||0;

    if(![
      "soDeDang",
      "soTranThang",
      "soTranThua"
    ].includes(key)){
      return old;
    }

    old[key]++;

    return old;
  });

  return result.committed;
}

async function changeName(){
  if(!currentUser)return;

  const name=prompt(
    "Nhập tên mới:",
    profile.ten||""
  );

  if(name===null)return;

  const newName=name.trim();

  if(
    newName.length<2||
    newName.length>50||
    /[.#$/\[\]]/.test(newName)
  ){
    alert("Tên phải từ 2-50 ký tự.");
    return;
  }

  try{
    await db.ref(
      "nguoiDung/"+currentUser.uid+"/ten"
    ).set(newName);
  }catch(e){
    alert(
      "Không đổi tên được: "+
      e.message
    );
  }
}