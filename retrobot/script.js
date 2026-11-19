const instructions = [
  "육각 테두리를 먼저 놓고, 검은 짧은 나사를 체결하세요.",
  "반대쪽 육각 테두리를 놓고, 검은 짧은 나사를 체결하세요.",
  "날개형 귀를 옆면 구멍에 맞추고, 짧은 검은 나사를 체결하세요.",
  "둥근 금속 면이 바깥을 보게 놓고, 가운데에 짧은 검은 나사를 체결하세요.",
  "긴 검은 나사를 밑면 왼쪽 구멍에 체결하세요. 발 모양의 나사 머리가 바깥에 남아요.",
  "밑면 오른쪽에 긴 검은 나사를 체결한 뒤, 실물 완성 샘플과 두 다리의 노출 길이를 비교하세요.",
];

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
let active = 0;

function stepFromLocation() {
  const value = new URL(location.href).searchParams.get("step");
  return /^[1-6]$/.test(value ?? "") ? Number(value) : 1;
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
  const code = String(number).padStart(2, "0");
  const item = items[number - 1];
  const label = item.querySelector("span").textContent;
  if (number !== active) {
    video.pause();
    active = number;
    video.poster = `media/${code}.jpg`;
    video.src = `media/${code}.mp4`;
    directVideo.href = video.src;
    heading.textContent = label;
    instruction.textContent = instructions[number - 1];
    counter.textContent = `${code} / 06`;
    counter.setAttribute("aria-label", `총 6단계 중 ${number}단계`);
    video.setAttribute("aria-label", `${label} 체결 영상`);
    items.forEach((link) => link.removeAttribute("aria-current"));
    item.setAttribute("aria-current", "step");
    previous.disabled = number === 1;
    next.disabled = number === items.length;
    error.hidden = true;
    status.textContent = `${number}단계 ${label}`;
  } else if (play) {
    video.currentTime = 0;
  }
  if (updateUrl && stepFromLocation() !== number) {
    const url = new URL(location.href);
    url.searchParams.set("step", number);
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
