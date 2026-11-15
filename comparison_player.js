const mode=document.querySelector('#scope'),shuffle=document.querySelector('#shuffle'),queue=document.querySelector('#queue');
for(const [i,t] of tracks.entries()){const o=document.createElement('option');o.value=i;o.textContent=t.group+' · '+t.title;s.append(o)}
let changing=false,requestId=0,continuous=true,bag=[],failed=false,advancing=false;
function pool(){return tracks.map((t,i)=>i).filter(i=>mode.value==='all'||tracks[i].group==='우선 비교 6곡')}
function controls(){shuffle.textContent=continuous?'랜덤 연속 끄기':'랜덤 연속 재생';shuffle.setAttribute('aria-pressed',String(continuous));queue.textContent=continuous?`랜덤 연속 켜짐 · ${pool().length}곡 중 이번 회차 남은 ${bag.length}곡 · 영상이 끝나면 다음 곡과 처음부터`:'영상 한 번이 끝날 때마다 다음 곡으로 넘어가며, 각 회차는 중복 없이 재생해.'}
function fail(e){failed=true;v.pause();a.pause();status.textContent='재생 확인 필요: '+(e?.message||e)}
async function ready(){if(a.readyState>=1)return;await new Promise((resolve,reject)=>{const done=()=>{clean();resolve()},error=()=>{clean();reject(Error(a.error?.message||'음원 열기 실패'))},timer=setTimeout(()=>{clean();reject(Error('음원 준비 시간이 길어지고 있어'))},10000);function clean(){clearTimeout(timer);a.removeEventListener('loadedmetadata',done);a.removeEventListener('error',error)}a.addEventListener('loadedmetadata',done,{once:true});a.addEventListener('error',error,{once:true})})}
async function pick({restart=false,autoplay=!v.paused}={}){const token=++requestId;changing=true;failed=false;v.pause();a.pause();if(restart)v.currentTime=0;const t=tracks[Number(s.value)];a.src=t.source_url;a.load();status.textContent='음원 준비 중';document.querySelector('#info').textContent=`${t.filename} · 밝기 지표 ${t.centroid_median_hz}Hz · 120Hz 미만 ${t.sub120_power_pct}% · 음량 변화폭 ${t.dynamic_p95_p05_db}dB`;try{await ready();if(token!==requestId)return;a.currentTime=v.currentTime;a.playbackRate=v.playbackRate;changing=false;status.textContent=t.group+' · 음악과 영상 같은 시점으로 준비됨';if(autoplay)await v.play()}catch(e){if(token===requestId){changing=false;fail(e)}}}
function nextRandom(){if(!bag.length){bag=pool();for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag.length>1&&bag[bag.length-1]===Number(s.value))[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]]}return bag.pop()}
async function advance(){if(advancing)return;advancing=true;try{const p=pool(),current=Number(s.value);s.value=String(continuous?nextRandom():p[(p.indexOf(current)+1)%p.length]);controls();await pick({restart:true,autoplay:true})}finally{advancing=false}}
s.onchange=()=>{bag=bag.filter(i=>i!==Number(s.value));controls();pick()};
shuffle.onclick=()=>{continuous=!continuous;bag=[];controls();if(continuous)advance()};
mode.onchange=()=>{bag=[];controls()};document.querySelector('#next').onclick=advance;
a.volume=.5;document.querySelector('#volume').oninput=e=>{a.volume=Number(e.target.value)};
document.querySelector('#play').onclick=async()=>{try{await ready();a.currentTime=v.currentTime;await v.play()}catch(e){fail(e)}};
document.querySelector('#pause').onclick=()=>{++requestId;changing=false;v.pause();a.pause();status.textContent=continuous?'멈춤 · 랜덤 순서는 유지돼. 함께 재생을 누르면 이어서 재생해':'멈춤 · 같은 장면에서 이어서 비교할 수 있어'};
v.onplay=async()=>{if(changing)return;const token=requestId;try{await ready();if(token!==requestId||v.paused)return;a.currentTime=v.currentTime;await a.play();if(!v.paused)status.textContent=continuous?'랜덤 연속 · 영상·음악 함께 재생 중':'영상·음악 함께 재생 중'}catch(e){if(token===requestId)fail(e)}};
v.onpause=()=>{a.pause();if(!changing&&!v.ended&&!failed)status.textContent=continuous?'멈춤 · 랜덤 순서는 유지돼':'멈춤 · 곡을 바꾸거나 같은 장면에서 이어서 비교할 수 있어'};
v.onseeking=()=>{if(a.readyState>=1&&!changing)a.currentTime=v.currentTime};v.onratechange=()=>a.playbackRate=v.playbackRate;
v.onended=()=>{a.pause();if(continuous&&!changing)advance();else status.textContent='영상 재생 완료'};
v.ontimeupdate=()=>{if(!v.paused&&!changing&&a.readyState>=2&&Math.abs(a.currentTime-v.currentTime)>.25)a.currentTime=v.currentTime};
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{v.currentTime=Number(b.dataset.time);if(a.readyState>=1)a.currentTime=v.currentTime});
s.value=String(nextRandom());controls();pick({autoplay:false});
