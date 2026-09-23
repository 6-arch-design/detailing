function setAppViewportHeight(){document.documentElement.style.setProperty('--app-vh',`${window.innerHeight}px`)}setAppViewportHeight();window.addEventListener('resize',setAppViewportHeight,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(setAppViewportHeight,150),{passive:true});const sections=[...document.querySelectorAll('.section')],flow=document.getElementById('flow'),num=document.getElementById('progressNum'),navTitle=document.getElementById('navTitle'),navCount=document.getElementById('navCount'),topTimer=document.getElementById('topTimer'),side=document.getElementById('sideIndex'),miniTimer=document.getElementById('miniTimer'),timerValue=document.getElementById('timerValue');let current=0,busy=false,touchY=0,touchTarget=null,touchFlowline=null,touchFlowlineTop=0,activeStage=null,stageStart=null,timerId=null,stageTimerId=null,stageTimerValue=null,sessionStart=window.detailingStartAt||null;function productSvg(type){const base='<svg viewBox="0 0 80 80" aria-hidden="true">';let body='';if(type==='spray'||type==='spraygold'||type==='sprayblue'||type==='spraydark'||type==='sprayer'){body='<path d="M32 20h17v7H32z" fill="#222"/><path d="M38 13h14v7H38z" fill="#444"/><path d="M26 27h28l-4 42H30z" fill="#d7d7d7" stroke="#777"/><path d="M31 39h18v17H31z" fill="#444" opacity=".7"/><path d="M55 23l15-6v4l-15 6z" fill="#555"/>'}else if(type==='brush'||type==='brush2'){body='<path d="M46 17h8v45h-8z" fill="#333" transform="rotate(25 50 40)"/><path d="M24 54h28v12H24z" rx="3" fill="#222" transform="rotate(25 38 60)"/><path d="M24 56l-8 11M31 57l-8 11M38 59l-8 11" stroke="#777" stroke-width="3"/>'}else if(type==='bottle'||type==='bottle2'||type==='foam'||type==='glass'||type==='bottleblue'){body='<path d="M32 17h16v10H32z" fill="#333"/><path d="M26 27h28v40H26z" rx="6" fill="#cfcfcf" stroke="#777"/><path d="M30 36h20v17H30z" fill="#555" opacity=".65"/><circle cx="40" cy="45" r="6" fill="#eee"/>'}else if(type==='block'){body='<rect x="17" y="29" width="46" height="25" rx="4" fill="#ddd" stroke="#777"/><path d="M20 34h40v5H20z" fill="#222"/><path d="M26 54l8 10h14l8-10z" fill="#bdbdbd"/>'}else if(type==='towel'){body='<path d="M14 20h52v42H14z" fill="#eee" stroke="#aaa"/><path d="M20 26h40v30H20z" fill="#d6e4e5"/><path d="M23 31h34M23 38h34M23 45h34" stroke="#fff" stroke-width="2"/>'}else if(type==='tool'||type==='nozzle'||type==='nozzle2'){body='<path d="M25 49h32v10H25z" fill="#333"/><path d="M49 34l22-8 2 7-22 8z" fill="#555"/><circle cx="31" cy="54" r="7" fill="#999"/><path d="M20 34h16v9H20z" fill="#bbb"/>'}else if(type==='bucket'){body='<path d="M21 25h38l-5 43H26z" fill="#777"/><path d="M21 25h38" stroke="#222" stroke-width="5"/><path d="M25 22q15-18 30 0" fill="none" stroke="#333" stroke-width="3"/>'}else if(type==='mitt'){body='<path d="M27 20q-8 4-5 20l5 25h26l5-23q2-12-5-15l-6 13-2-20-7 1-1 18-4-19z" fill="#555" stroke="#333"/>'}else if(type==='cup'){body='<path d="M28 16h24l-4 50H32z" fill="#e8e8e8" stroke="#888"/><path d="M28 28h24M30 38h20" stroke="#aaa"/>'}else{body='<circle cx="40" cy="40" r="24" fill="#ddd" stroke="#777"/><path d="M25 40h30" stroke="#333" stroke-width="4"/>'}return base+body+'</svg>'}function Product({icon,title,sub,note,image,photo,key}){return `<div class="product" tabindex="0" role="button" aria-pressed="false" data-product-key="${key||""}"><div class="art product-upload-art" data-upload-art><input class="product-file-input" type="file" accept="image/png,.png" aria-label="${title} PNG 사진 선택"><span class="upload-placeholder"><b>PNG</b><small>사진 추가</small></span></div><div class="name">${title}</div><div class="sub">${sub}</div><div class="note">${note}</div><span class="product-toggle" aria-hidden="true">OFF</span></div>`}function hydrate(){document.querySelectorAll('Product').forEach(el=>{const section=el.closest('.section');const sectionIndex=[...document.querySelectorAll('.section')].indexOf(section);const productIndex=[...section.querySelectorAll('Product')].indexOf(el);el.dataset.key=`${sectionIndex+1}-${productIndex+1}`;el.outerHTML=Product(el.dataset)})}hydrate();
const PRODUCT_DB='detailing-product-images-v1';
function openProductDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PRODUCT_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function saveProductImage(key,dataUrl){try{const db=await openProductDb();await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(dataUrl,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}catch(e){}}
async function loadProductImage(key){try{const db=await openProductDb();const value=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});db.close();return value;}catch(e){return null;}}
function applyProductImage(product,dataUrl){const art=product.querySelector('[data-upload-art]');if(!art)return;art.classList.add('has-image');const ph=art.querySelector('.upload-placeholder');if(ph)ph.remove();let img=art.querySelector('img');if(!img){img=document.createElement('img');img.alt=product.querySelector('.name')?.textContent||'제품 사진';art.appendChild(img);}img.src=dataUrl;}
async function initProductUploads(){document.querySelectorAll('.product').forEach(product=>{const key=product.dataset.productKey,art=product.querySelector('[data-upload-art]'),input=product.querySelector('.product-file-input');if(!key||!art||!input)return;art.addEventListener('click',e=>{e.stopPropagation();input.click();});input.addEventListener('click',e=>e.stopPropagation());input.addEventListener('change',e=>{e.stopPropagation();const file=e.target.files?.[0];if(!file)return;if(file.type!=='image/png'&&!file.name.toLowerCase().endsWith('.png')){input.value='';return;}const reader=new FileReader();reader.onload=async()=>{const dataUrl=String(reader.result||'');if(dataUrl){applyProductImage(product,dataUrl);await saveProductImage(key,dataUrl);}};reader.readAsDataURL(file);input.value='';});loadProductImage(key).then(dataUrl=>{if(dataUrl)applyProductImage(product,dataUrl);});});}
initProductUploads();

function initProductPreparation(){
  sections.forEach(section=>{
    const head=section.querySelector('.section-head');
    const products=[...section.querySelectorAll('.product')];
    if(head&&!head.querySelector('.section-prep-status')){
      const status=document.createElement('div');
      status.className='section-prep-status';
      head.appendChild(status);
    }
    section.querySelectorAll('.box').forEach(box=>{
      const boxProducts=[...box.querySelectorAll('.product')];
      if(!boxProducts.length)return;
      if(!box.querySelector('.product-prep-status')){
        const status=document.createElement('div');
        status.className='product-prep-status';
        box.appendChild(status);
      }
    });
    const update=()=>{
      const ready=products.filter(p=>p.classList.contains('is-ready')).length;
      const complete=products.length>0&&ready===products.length;
      const sectionStatus=section.querySelector('.section-prep-status');
      if(sectionStatus){
        sectionStatus.textContent=complete?'✓ 제품 준비 완료':`제품 준비 ${ready} / ${products.length}`;
        sectionStatus.classList.toggle('complete',complete);
      }
      section.querySelectorAll('.box').forEach(box=>{
        const bp=[...box.querySelectorAll('.product')];
        const bs=box.querySelector('.product-prep-status');
        if(!bs||!bp.length)return;
        const br=bp.filter(p=>p.classList.contains('is-ready')).length;
        const bc=br===bp.length;
        bs.textContent=bc?'✓ 준비 완료':`준비 ${br} / ${bp.length}`;
        bs.classList.toggle('complete',bc);
      });
    };
    products.forEach(product=>{
      const toggle=()=>{
        const ready=product.classList.toggle('is-ready');
        product.setAttribute('aria-pressed',ready?'true':'false');
        const toggleEl=product.querySelector('.product-toggle');
        if(toggleEl)toggleEl.textContent=ready?'ON ✓':'OFF';
        update();
      };
      product.addEventListener('click',e=>{e.stopPropagation();toggle()});
      product.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggle()}
      });
    });
    update();
  });
}
initProductPreparation();if(sessionStart)startTimer(null);function stagesFor(section){return[...section.querySelectorAll('.flowline > .pill, .flowline > .box')]}function clearStage(){sections.forEach(s=>s.querySelectorAll('.is-current,.is-done').forEach(el=>el.classList.remove('is-current','is-done')));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());activeStage=null;stageTimerValue=null;stageStart=null;clearInterval(stageTimerId);stageTimerId=null;if(timerValue)timerValue.textContent='00:00'}function formatTime(ms){const sec=Math.max(0,Math.floor(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}function updateTotalTimer(){if(!sessionStart||!topTimer)return;topTimer.textContent=formatTime(Date.now()-sessionStart)}function updateStageTimer(){if(!stageStart||!stageTimerValue)return;stageTimerValue.textContent=formatTime(Date.now()-stageStart)}function startTotalTimer(){clearInterval(timerId);updateTotalTimer();timerId=setInterval(updateTotalTimer,250)}function startStageTimer(){clearInterval(stageTimerId);updateStageTimer();stageTimerId=setInterval(updateStageTimer,250)}function selectStage(stage){const all=sections.flatMap(s=>stagesFor(s)),idx=all.indexOf(stage);if(idx<0)return;const wasCurrent=stage.classList.contains('is-current');if(wasCurrent){all.forEach(el=>el.classList.remove('is-current','is-done'));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());activeStage=null;stageTimerValue=null;stageStart=null;clearInterval(stageTimerId);stageTimerId=null;if(timerValue)timerValue.textContent='00:00';return}all.forEach(el=>el.classList.remove('is-current','is-done'));all.slice(0,idx).forEach(el=>el.classList.add('is-done'));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());stage.classList.add('is-current');const timer=document.createElement('span');timer.className='stage-inline-timer';timer.innerHTML='<span class="stage-timer-label">진행</span><span class="stage-timer-dot">●</span><strong>00:00</strong>';stage.insertAdjacentElement('afterend',timer);stageTimerValue=timer.querySelector('strong');stageStart=Date.now();startStageTimer();const sectionIndex=sections.findIndex(s=>s.contains(stage));if(sectionIndex>=0)setCurrentSection(sectionIndex);stage.scrollIntoView({behavior:'smooth',block:'center'})}function bindStageClicks(){sections.forEach(section=>stagesFor(section).forEach(stage=>stage.addEventListener('click',()=>selectStage(stage))))}bindStageClicks();document.getElementById('letsGo')?.addEventListener('click',()=>{sessionStart=window.detailingStartAt||Date.now();stageStart=null;startTotalTimer()},{once:true});if(sessionStart)startTotalTimer();function renderSide(){side.innerHTML=sections.map((s,i)=>`<button aria-label="${s.dataset.title}" data-i="${i}" class="${i===0?'active':''}">${String(i+1).padStart(2,'0')}</button>`).join('');side.querySelectorAll('button').forEach(b=>b.onclick=()=>scrollToSection(+b.dataset.i))}
function scrollToSection(i){if(i<0||i>=sections.length)return;const top=sections[i].getBoundingClientRect().top+window.scrollY-60;window.scrollTo({top:Math.max(0,top),behavior:'smooth'})}
function setCurrentSection(i){if(i<0||i>=sections.length)return;current=i;num.textContent=String(i+1).padStart(2,'0');navTitle.textContent=sections[i].dataset.title;navCount.textContent=`${String(i+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}`;side.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===i))}
function updateSectionFromScroll(){const probe=window.innerHeight*.42;let best=0,bestScore=-Infinity;sections.forEach((s,i)=>{const r=s.getBoundingClientRect();const top=Math.max(r.top,0),bottom=Math.min(r.bottom,window.innerHeight);const visible=Math.max(0,bottom-top);const center=(r.top+r.bottom)/2;const score=visible-Math.abs(center-probe)*.12;if(score>bestScore){bestScore=score;best=i}});if(best!==current){current=best;setCurrentSection(best)}else setCurrentSection(current)}
function updateGauge(){const max=document.documentElement.scrollHeight-window.innerHeight;const p=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;document.documentElement.style.setProperty('--scroll-progress',p)}
let ticking=false;
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateSectionFromScroll();updateGauge();ticking=false});ticking=true}},{passive:true});
document.getElementById('next').onclick=()=>{const n=Math.min(sections.length-1,current+1);scrollToSection(n)};
document.getElementById('prev').onclick=()=>{const n=Math.max(0,current-1);sections[n].scrollIntoView({behavior:'smooth',block:'start'})};
renderSide();updateSectionFromScroll();updateGauge();