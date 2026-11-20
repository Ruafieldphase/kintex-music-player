const items = [...document.querySelectorAll("[data-step]")];
const player = document.querySelector(".player");
const video = document.getElementById("stage-video");
const full = document.getElementById("full");
const fullVideo = document.getElementById("full-video");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const replay = document.getElementById("replay");
const heading = document.getElementById("stage-heading");
const counter = document.getElementById("counter");
const instruction = document.getElementById("instruction");
const status = document.getElementById("status");
const error = document.getElementById("load-error");
const directVideo = document.getElementById("direct-video");
let active = -1;

function stepFromLocation() {
  const params = new URL(location.href).searchParams;
  const stage = params.get("stage");
  if (/^[0-8]$/.test(stage ?? "")) return Number(stage);
  // Keep previously shared six-stage links pointing to the original part.
  const legacy = params.get("step");
  return /^[1-6]$/.test(legacy ?? "") ? [0,1,2,3,5,7,8][Number(legacy)] : 0;
}

function playStep() {
  const requestedStep = active;
  video.play().catch((failure) => {
    if (active === requestedStep && failure.name !== "AbortError") {
      status.textContent = "영상의 재생 버튼을 눌러주세요.";
    }
  });
}

function showStep(number, { play = false, updateUrl = false, scroll = false } = {}) {
  const code = number ? String(number).padStart(2, "0") : "overview";
  const item = items[number];
  const label = item.querySelector("span").textContent;
  if (number !== active) {
    video.pause();
    active = number;
    const version = number === 0 ? "?v=9" : "";
    video.poster = `media/eight/${code}.jpg${version}`;
    video.src = `media/eight/${code}.mp4${version}`;
    directVideo.href = video.src;
    heading.textContent = label;
    instruction.textContent = item.dataset.instruction;
    counter.textContent = number ? `${code} / 08` : "시작";
    counter.setAttribute("aria-label", number ? `총 8단계 중 ${number}단계` : "시작");
    video.setAttribute("aria-label", `${label} 영상`);
    items.forEach((link) => link.removeAttribute("aria-current"));
    item.setAttribute("aria-current", "step");
    previous.disabled = number === 0;
    next.disabled = number === items.length - 1;
    error.hidden = true;
    status.textContent = `${number}단계 ${label}`;
  } else if (play) {
    video.currentTime = 0;
  }
  if (updateUrl && stepFromLocation() !== number) {
    const url = new URL(location.href);
    url.searchParams.delete("step");
    url.searchParams.set("stage", number);
    history.pushState(null, "", url);
  }
  if (scroll && player.getBoundingClientRect().top < 0) {
    player.scrollIntoView({ block: "start" });
  }
  if (play) {
    fullVideo.pause();
    playStep();
  }
}

items.forEach((item) => {
  item.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showStep(Number(item.dataset.step), { play: true, updateUrl: true, scroll: true });
  });
});
previous.addEventListener("click", () => showStep(active - 1, { play: true, updateUrl: true }));
next.addEventListener("click", () => showStep(active + 1, { play: true, updateUrl: true }));
replay.addEventListener("click", () => showStep(active, { play: true }));
window.addEventListener("popstate", () => showStep(stepFromLocation()));
video.addEventListener("error", () => { error.hidden = false; });
video.addEventListener("play", () => fullVideo.pause());
fullVideo.addEventListener("play", () => video.pause());
full.addEventListener("toggle", () => {
  if (!full.open) fullVideo.pause();
  else if (!fullVideo.hasAttribute("src")) fullVideo.src = fullVideo.dataset.src;
});
showStep(stepFromLocation());
