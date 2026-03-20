const GUIDE_STEPS = [
  {
    id: 1,
    shortLabel: "STEP1",
    hasSubSteps: true,
    subSteps: [
      {
        title: "품고 나우 로그인",
        leftFile: "./steps/step1-login-left.html",
        rightFile: "./steps/step1-login-right-player.html",
        helpFile: "./help/step1-login-help.html"
      },
      {
        title: "구성원 추가",
        leftFile: "./steps/step1-member-left.html",
        rightFile: "./steps/step1-member-right-player.html",
        helpFile: "./help/step1-member-help.html"
      }
    ]
  },
  {
    id: 2,
    shortLabel: "STEP2",
    hasSubSteps: true,
    subSteps: [
      {
        title: "판매처 등록",
        leftFile: "./steps/step2-new-left.html",
        rightFile: "./steps/step2-new-right-player.html",
        helpFile: "./help/step2-new-help.html"
      },
      {
        title: "풀필먼트 연동",
        leftFile: "./steps/step2-api-left.html",
        rightFile: "./steps/step2-api-right-player.html",
        helpFile: "./help/step2-api-help.html"
      },
      {
        title: "N배송 프로그램 이용 동의",
        leftFile: "./steps/step2-npro-left.html",
        rightFile: "./steps/step2-npro-right-player.html",
        helpFile: "./help/step2-npro-help.html"
      }
    ]
  },
  {
    id: 3,
    shortLabel: "STEP3",
    hasSubSteps: false,
    title: "풀필먼트 연동",
    leftFile: "./steps/step3-left.html",
    rightFile: "./steps/step3-right-player.html",
    helpFile: "./help/step3-help.html"
  }
];

let currentStepIndex = 0;
let currentSubStepIndex = 0;

const progressTitle = document.getElementById("progressTitle");
const progressMeta = document.getElementById("progressMeta");
const progressTrack = document.getElementById("progressTrack");

const stepKicker = document.getElementById("stepKicker");
const stepTitle = document.getElementById("stepTitle");
const leftContent = document.getElementById("leftContent");
const rightContent = document.getElementById("rightContent");
const slideTitle = document.getElementById("slideTitle");
const slideCount = document.getElementById("slideCount");
const slideDots = document.getElementById("slideDots");

const prevStepBtn = document.getElementById("prevStepBtn");
const nextStepBtn = document.getElementById("nextStepBtn");
const prevSlideBtn = document.getElementById("prevSlideBtn");
const nextSlideBtn = document.getElementById("nextSlideBtn");

const helpBtn = document.getElementById("helpBtn");
const drawerOverlay = document.getElementById("drawerOverlay");
const helpDrawer = document.getElementById("helpDrawer");
const closeHelpBtn = document.getElementById("closeHelpBtn");
const helpContent = document.getElementById("helpContent");
const drawerTitle = document.getElementById("drawerTitle");

function cacheBust(url) {
  return `${url}?v=${Date.now()}`;
}

async function fetchHtml(url) {
  const response = await fetch(cacheBust(url), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`파일을 불러오지 못했습니다: ${url}`);
  }
  return await response.text();
}

function getCurrentView() {
  const step = GUIDE_STEPS[currentStepIndex];
  if (step.hasSubSteps) {
    return {
      step,
      view: step.subSteps[currentSubStepIndex]
    };
  }
  return {
    step,
    view: step
  };
}

function renderProgress() {
  progressTrack.innerHTML = "";
  const total = GUIDE_STEPS.length;
  const current = currentStepIndex + 1;

  progressTitle.textContent = `STEP ${current} 진행 중`;
  progressMeta.textContent = `${current} / ${total}`;

  GUIDE_STEPS.forEach((step, index) => {
    const stepWrap = document.createElement("div");
    let stateClass = "";
    if (index < currentStepIndex) stateClass = "done";
    if (index === currentStepIndex) stateClass = "current";

    stepWrap.className = `progress-step ${stateClass}`;

    const nodeWrap = document.createElement("div");
    nodeWrap.className = "progress-node-wrap";

    const node = document.createElement("div");
    node.className = "progress-node";
    node.textContent = index < currentStepIndex ? "✓" : step.id;

    const text = document.createElement("div");
    text.className = "progress-text";
    text.textContent = `STEP ${step.id}`;

    nodeWrap.appendChild(node);
    nodeWrap.appendChild(text);
    stepWrap.appendChild(nodeWrap);

    if (index < GUIDE_STEPS.length - 1) {
      const line = document.createElement("div");
      line.className = "progress-line";
      stepWrap.appendChild(line);
    }

    progressTrack.appendChild(stepWrap);
  });
}

function renderSlideDots() {
  slideDots.innerHTML = "";
  if (slideTitle) slideTitle.textContent = "";
  if (slideCount) slideCount.textContent = "";
  if (prevSlideBtn) prevSlideBtn.style.display = "none";
  if (nextSlideBtn) nextSlideBtn.style.display = "none";
}

async function renderLeftPanel() {
  const { step, view } = getCurrentView();

  stepKicker.textContent = `STEP ${step.id}`;
  stepTitle.textContent = view.title;
  leftContent.innerHTML = `<div class="loading-box">설명 화면을 불러오는 중입니다...</div>`;

  try {
    const html = await fetchHtml(view.leftFile);
    leftContent.innerHTML = html;
  } catch (error) {
    leftContent.innerHTML = `<div class="loading-box">${error.message}</div>`;
    console.error(error);
  }
}

async function renderRightPanel() {
  const { view } = getCurrentView();

  rightContent.innerHTML = `<div class="loading-box">화면 예시를 불러오는 중입니다...</div>`;

  try {
    rightContent.innerHTML = `
      <div class="slide-frame" style="padding:0; overflow:hidden;">
        <iframe
          src="${cacheBust(view.rightFile)}"
          title="${view.title}"
          style="width:100%; height:100%; border:0; display:block; background:#fff;"
          loading="eager"
          referrerpolicy="no-referrer"
          allow="autoplay"
        ></iframe>
      </div>
    `;
  } catch (error) {
    rightContent.innerHTML = `<div class="loading-box">${error.message}</div>`;
    console.error(error);
  }

  renderSlideDots();
}

async function renderHelpPanel() {
  const { view } = getCurrentView();

  drawerTitle.textContent = `${view.title} 도움말`;
  helpContent.innerHTML = `<div class="loading-box">도움말을 불러오는 중입니다...</div>`;

  try {
    const html = await fetchHtml(view.helpFile);
    helpContent.innerHTML = html;
  } catch (error) {
    helpContent.innerHTML = `<div class="loading-box">${error.message}</div>`;
    console.error(error);
  }
}

function updateStepButtons() {
  prevStepBtn.style.visibility = currentStepIndex === 0 ? "hidden" : "visible";

  if (currentStepIndex === GUIDE_STEPS.length - 1) {
    nextStepBtn.textContent = "가이드 완료";
    nextStepBtn.classList.add("btn-complete");
    nextStepBtn.classList.remove("btn-primary");
  } else {
    nextStepBtn.textContent = "다음 단계";
    nextStepBtn.classList.add("btn-primary");
    nextStepBtn.classList.remove("btn-complete");
  }
}

async function renderCurrentStep() {
  renderProgress();
  updateStepButtons();
  await renderLeftPanel();
  await renderRightPanel();
  await renderHelpPanel();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function goPrevStep() {
  if (currentStepIndex > 0) {
    currentStepIndex -= 1;
    currentSubStepIndex = 0;
    await renderCurrentStep();
  }
}

async function goNextStep() {
  const step = GUIDE_STEPS[currentStepIndex];

  if (step.hasSubSteps && currentSubStepIndex < step.subSteps.length - 1) {
    currentSubStepIndex += 1;
    await renderCurrentStep();
    return;
  }

  if (currentStepIndex < GUIDE_STEPS.length - 1) {
    currentStepIndex += 1;
    currentSubStepIndex = 0;
    await renderCurrentStep();
  } else {
    alert("수고하셨습니다! 가이드 확인이 완료되었습니다.");
  }
}

function openHelpDrawer() {
  drawerOverlay.classList.add("open");
  helpDrawer.classList.add("open");
  helpDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}

function closeHelpDrawer() {
  drawerOverlay.classList.remove("open");
  helpDrawer.classList.remove("open");
  helpDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

prevStepBtn.addEventListener("click", goPrevStep);
nextStepBtn.addEventListener("click", goNextStep);

if (prevSlideBtn) prevSlideBtn.style.display = "none";
if (nextSlideBtn) nextSlideBtn.style.display = "none";

helpBtn.addEventListener("click", openHelpDrawer);
closeHelpBtn.addEventListener("click", closeHelpDrawer);
drawerOverlay.addEventListener("click", closeHelpDrawer);

document.addEventListener("keydown", async (event) => {
  if (event.key === "Escape") closeHelpDrawer();
});

renderCurrentStep();
