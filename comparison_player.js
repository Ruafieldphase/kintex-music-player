const mode=document.querySelector('#scope'),shuffle=document.querySelector('#shuffle'),queue=document.querySelector('#queue');
for(const [i,t] of tracks.entries()){const o=document.createElement('option');o.value=i;o.textContent=t.title;s.append(o)}
let changing=false,requestId=0,continuous=true,bag=[],failed=false,advancing=false;
function pool(){return tracks.map((t,i)=>i).filter(i=>mode.value==='all'||(tracks[i].featured??(tracks[i].group==='우선 비교 6곡')))}
function controls(){shuffle.textContent=continuous?'랜덤 연속 끄기':'랜덤 연속 재생';shuffle.setAttribute('aria-pressed',String(continuous));queue.textContent=continuous?`선택한 ${pool().length}곡을 무작위 순서로 이어 재생합니다.`:'음악을 직접 선택해 감상할 수 있어요.'}
function fail(e){failed=true;v.pause();a.pause();status.textContent=e?.name==='NotAllowedError'?'재생 버튼을 한 번 눌러주세요.':'음악을 재생하지 못했어요. 연결 상태를 확인한 뒤 다시 재생해 주세요.'}
async function ready(){if(a.readyState>=1)return;await new Promise((resolve,reject)=>{const done=()=>{clean();resolve()},error=()=>{clean();reject(Error(a.error?.message||'음악을 불러오지 못했어요.'))},timer=setTimeout(()=>{clean();reject(Error('음악을 불러오는 데 시간이 걸리고 있어요.'))},10000);function clean(){clearTimeout(timer);a.removeEventListener('loadedmetadata',done);a.removeEventListener('error',error)}a.addEventListener('loadedmetadata',done,{once:true});a.addEventListener('error',error,{once:true})})}
async function pick({restart=false,autoplay=!v.paused}={}){const token=++requestId;changing=true;failed=false;v.pause();a.pause();if(restart)v.currentTime=0;const t=tracks[Number(s.value)];a.src=t.source_url;a.load();status.textContent='음악을 준비하고 있어요.';document.querySelector('#info').textContent='지금 흐르는 음악 · '+t.title;try{await ready();if(token!==requestId)return;a.currentTime=v.currentTime;a.playbackRate=v.playbackRate;changing=false;status.textContent='준비됐어요. ‘감상 시작’을 눌러주세요.';if(autoplay)await v.play()}catch(e){if(token===requestId){changing=false;fail(e)}}}
function nextRandom(){if(!bag.length){bag=pool();for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag.length>1&&bag[bag.length-1]===Number(s.value))[bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]]}return bag.pop()}
async function advance(){if(advancing)return;advancing=true;try{const p=pool(),current=Number(s.value);s.value=String(continuous?nextRandom():p[(p.indexOf(current)+1)%p.length]);controls();await pick({restart:true,autoplay:true})}finally{advancing=false}}
s.onchange=()=>{bag=bag.filter(i=>i!==Number(s.value));controls();pick()};
shuffle.onclick=()=>{continuous=!continuous;bag=[];controls();if(continuous)advance()};
mode.onchange=()=>{bag=[];controls()};document.querySelector('#next').onclick=advance;
a.volume=.5;document.querySelector('#volume').oninput=e=>{a.volume=Number(e.target.value)};
document.querySelector('#play').onclick=async()=>{try{await ready();a.currentTime=v.currentTime;await v.play()}catch(e){fail(e)}};
document.querySelector('#pause').onclick=()=>{++requestId;changing=false;v.pause();a.pause();status.textContent=continuous?'잠시 멈췄어요. 감상 시작을 누르면 이어집니다.':'잠시 멈췄어요. 감상 시작을 누르면 이어집니다.'};
v.onplay=async()=>{if(changing)return;const token=requestId;try{await ready();if(token!==requestId||v.paused)return;a.currentTime=v.currentTime;await a.play();if(!v.paused)status.textContent=continuous?'랜덤 연속 재생 중':'감상 중'}catch(e){if(token===requestId)fail(e)}};
v.onpause=()=>{a.pause();if(!changing&&!v.ended&&!failed)status.textContent=continuous?'잠시 멈췄어요. 감상 시작을 누르면 이어집니다.':'잠시 멈췄어요. 다른 음악을 선택할 수도 있어요.'};
v.onseeking=()=>{if(a.readyState>=1&&!changing)a.currentTime=v.currentTime};v.onratechange=()=>a.playbackRate=v.playbackRate;
v.onended=()=>{a.pause();if(continuous&&!changing)advance();else status.textContent='감상이 끝났어요. 다른 음악으로 다시 만나보세요.'};
v.ontimeupdate=()=>{if(!v.paused&&!changing&&a.readyState>=2&&Math.abs(a.currentTime-v.currentTime)>.25)a.currentTime=v.currentTime};
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{v.currentTime=Number(b.dataset.time);if(a.readyState>=1)a.currentTime=v.currentTime});
s.value=String(nextRandom());controls();pick({autoplay:false});
