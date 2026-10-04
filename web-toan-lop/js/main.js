let currentUser=null;
let profile={};
let stats={};
let registerMode=false;
let selectedClass="";
let activeMatchId=null;
let matchListener=null;
let matchTimer=null;

const processedMatches=new Set();
const roundLocks=new Set();

const $=id=>document.getElementById(id);

function esc(value){
  return String(value??"").replace(
    /[&<>"']/g,
    c=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[c])
  );
}

function makeAvatar(name){
  const colors=[
    "#e53e3e","#dd6b20","#d69e2e",
    "#38a169","#319795","#3182ce",
    "#5a67d8","#805ad5","#d53f8c"
  ];

  name=String(name||"?");

  let hash=0;

  for(let i=0;i<name.length;i++){
    hash=name.charCodeAt(i)+((hash<<5)-hash);
  }

  const span=document.createElement("span");

  span.className="avatar";

  span.style.background=
    colors[Math.abs(hash)%colors.length];

  span.textContent=
    name.charAt(0).toUpperCase();

  return span;
}

function getLevelInfo(xp){
  xp=Number(xp)||0;

  let level=1;
  let required=100;
  let remain=xp;

  while(remain>=required){
    remain-=required;
    level++;
    required=100+(level-1)*50;
  }

  return {level,remain,required};
}

function localDate(date=new Date()){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0");

  return `${y}-${m}-${d}`;
}

function getStreak(){
  const today=localDate();

  const last=localStorage.getItem("lastActive");

  const old=
    Number(localStorage.getItem("streak"))||0;

  if(last===today)
    return old;

  const yesterday=new Date();

  yesterday.setDate(
    yesterday.getDate()-1
  );

  const streak=
    last===localDate(yesterday)
      ? old+1
      : 1;

  localStorage.setItem(
    "lastActive",
    today
  );

  localStorage.setItem(
    "streak",
    streak
  );

  return streak;
}

function renderStreak(){
  $("streak").textContent=
    "🔥 "+getStreak()+" ngày";
}

document.documentElement.dataset.theme=
  localStorage.getItem("theme")||"light";

function toggleTheme(){
  const dark=
    document.documentElement.dataset.theme==="dark";

  const theme=dark?"light":"dark";

  document.documentElement.dataset.theme=theme;

  localStorage.setItem("theme",theme);
}

window.addEventListener(
  "unhandledrejection",
  event=>{
    console.error(
      "Unhandled error:",
      event.reason
    );
  }
);