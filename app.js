function setAppViewportHeight(){document.documentElement.style.setProperty('--app-vh',`${window.innerHeight}px`)}setAppViewportHeight();window.addEventListener('resize',setAppViewportHeight,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(setAppViewportHeight,150),{passive:true});const sections=[...document.querySelectorAll('.section')],flow=document.getElementById('flow'),num=document.getElementById('progressNum'),navTitle=document.getElementById('navTitle'),navCount=document.getElementById('navCount'),topTimer=document.getElementById('topTimer'),side=document.getElementById('sideIndex'),miniTimer=document.getElementById('miniTimer'),timerValue=document.getElementById('timerValue');let current=0,busy=false,touchY=0,touchTarget=null,touchFlowline=null,touchFlowlineTop=0,activeStage=null,stageStart=null,timerId=null,stageTimerId=null,stageTimerValue=null,sessionStart=Date.now();function productSvg(type){const base='<svg viewBox="0 0 80 80" aria-hidden="true">';let body='';if(type==='spray'||type==='spraygold'||type==='sprayblue'||type==='spraydark'||type==='sprayer'){body='<path d="M32 20h17v7H32z" fill="#222"/><path d="M38 13h14v7H38z" fill="#444"/><path d="M26 27h28l-4 42H30z" fill="#d7d7d7" stroke="#777"/><path d="M31 39h18v17H31z" fill="#444" opacity=".7"/><path d="M55 23l15-6v4l-15 6z" fill="#555"/>'}else if(type==='brush'||type==='brush2'){body='<path d="M46 17h8v45h-8z" fill="#333" transform="rotate(25 50 40)"/><path d="M24 54h28v12H24z" rx="3" fill="#222" transform="rotate(25 38 60)"/><path d="M24 56l-8 11M31 57l-8 11M38 59l-8 11" stroke="#777" stroke-width="3"/>'}else if(type==='bottle'||type==='bottle2'||type==='foam'||type==='glass'||type==='bottleblue'){body='<path d="M32 17h16v10H32z" fill="#333"/><path d="M26 27h28v40H26z" rx="6" fill="#cfcfcf" stroke="#777"/><path d="M30 36h20v17H30z" fill="#555" opacity=".65"/><circle cx="40" cy="45" r="6" fill="#eee"/>'}else if(type==='block'){body='<rect x="17" y="29" width="46" height="25" rx="4" fill="#ddd" stroke="#777"/><path d="M20 34h40v5H20z" fill="#222"/><path d="M26 54l8 10h14l8-10z" fill="#bdbdbd"/>'}else if(type==='towel'){body='<path d="M14 20h52v42H14z" fill="#eee" stroke="#aaa"/><path d="M20 26h40v30H20z" fill="#d6e4e5"/><path d="M23 31h34M23 38h34M23 45h34" stroke="#fff" stroke-width="2"/>'}else if(type==='tool'||type==='nozzle'||type==='nozzle2'){body='<path d="M25 49h32v10H25z" fill="#333"/><path d="M49 34l22-8 2 7-22 8z" fill="#555"/><circle cx="31" cy="54" r="7" fill="#999"/><path d="M20 34h16v9H20z" fill="#bbb"/>'}else if(type==='bucket'){body='<path d="M21 25h38l-5 43H26z" fill="#777"/><path d="M21 25h38" stroke="#222" stroke-width="5"/><path d="M25 22q15-18 30 0" fill="none" stroke="#333" stroke-width="3"/>'}else if(type==='mitt'){body='<path d="M27 20q-8 4-5 20l5 25h26l5-23q2-12-5-15l-6 13-2-20-7 1-1 18-4-19z" fill="#555" stroke="#333"/>'}else if(type==='cup'){body='<path d="M28 16h24l-4 50H32z" fill="#e8e8e8" stroke="#888"/><path d="M28 28h24M30 38h20" stroke="#aaa"/>'}else{body='<circle cx="40" cy="40" r="24" fill="#ddd" stroke="#777"/><path d="M25 40h30" stroke="#333" stroke-width="4"/>'}return base+body+'</svg>'}function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}function Product({icon,title,sub,note,image,photo,key}){return `<div class="product" tabindex="0" role="button" aria-pressed="false" data-product-key="${esc(key||"")}"><div class="art product-upload-art" data-upload-art><input class="product-file-input" type="file" accept="image/png,.png" aria-label="${esc(title)} PNG 사진 선택"><span class="upload-placeholder"><b>PNG</b><small>사진 추가</small></span></div><div class="name" data-edit-field="title">${esc(title)}</div><div class="sub" data-edit-field="sub">${esc(sub)}</div><div class="note" data-edit-field="note">${esc(note)}</div><button type="button" class="product-delete" aria-label="제품 삭제">×</button><button type="button" class="product-save-button" aria-label="제품 저장">SAVE</button><span class="product-toggle" aria-hidden="true">OFF</span></div>`}function hydrate(){document.querySelectorAll('Product').forEach(el=>{const section=el.closest('.section');const sectionIndex=[...document.querySelectorAll('.section')].indexOf(section);const productIndex=[...section.querySelectorAll('Product')].indexOf(el);el.dataset.key=`${sectionIndex+1}-${productIndex+1}`;el.outerHTML=Product(el.dataset)})}hydrate();
const PRODUCT_DB='detailing-product-images-v3';
function openProductDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PRODUCT_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('images'))req.result.createObjectStore('images');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function saveProductImage(key,blob){try{const db=await openProductDb();await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();}catch(e){console.warn('image save failed',e)}}
async function loadLegacyProductImage(key){try{const req=indexedDB.open('detailing-product-images-v2',1);const db=await new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});if(!db.objectStoreNames.contains('images')){db.close();return null}const value=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const r=tx.objectStore('images').get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)});db.close();return value}catch(e){return null}}
async function loadProductImage(key){try{const db=await openProductDb();const value=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();if(value)return value;const legacy=await loadLegacyProductImage(key);if(legacy){let blob=legacy;if(typeof legacy==='string'){try{blob=await fetch(legacy).then(r=>r.blob())}catch(e){blob=null}}if(blob){await saveProductImage(key,blob);return blob}}return null}catch(e){return null}}
function applyProductImage(product,data){const art=product.querySelector('[data-upload-art]');if(!art)return;art.classList.add('has-image');const ph=art.querySelector('.upload-placeholder');if(ph)ph.remove();let img=art.querySelector('img');if(!img){img=document.createElement('img');img.alt=product.querySelector('.name')?.textContent||'제품 사진';art.appendChild(img)}if(img.dataset.objectUrl){try{URL.revokeObjectURL(img.dataset.objectUrl)}catch(e){}}if(data instanceof Blob){const url=URL.createObjectURL(data);img.dataset.objectUrl=url;img.src=url}else{img.src=String(data||'')}}
async function bindProductUpload(product){const key=product.dataset.productKey,art=product.querySelector('[data-upload-art]'),input=product.querySelector('.product-file-input');if(!key||!art||!input)return;if(product.dataset.uploadBound==='1')return;product.dataset.uploadBound='1';art.addEventListener('click',e=>{e.stopPropagation();input.click()});input.addEventListener('click',e=>e.stopPropagation());input.addEventListener('change',e=>{e.stopPropagation();const file=e.target.files?.[0];if(!file)return;if(file.type!=='image/png'&&!file.name.toLowerCase().endsWith('.png')){input.value='';alert('PNG 파일만 넣을 수 있어요.');return}applyProductImage(product,file);product.__pendingImageBlob=file;saveProductImage(key,file);input.value=''});const saved=await loadProductImage(key);if(saved)applyProductImage(product,saved)}
async function initProductUploads(){for(const product of document.querySelectorAll('.product'))await bindProductUpload(product)}
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
      product.dataset.prepBound='1';
    });
    update();
  });
}
initProductPreparation();
/* EDITABLE PRODUCT INFO + DYNAMIC PRODUCT ADDITIONS */
const PRODUCT_STATE_DB='detailing-product-state-v4';
function openProductStateDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PRODUCT_STATE_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('boxes'))req.result.createObjectStore('boxes');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function statePut(boxKey,value){const db=await openProductStateDb();await new Promise((resolve,reject)=>{const tx=db.transaction('boxes','readwrite');tx.objectStore('boxes').put(value,boxKey);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}
async function stateAll(){try{const db=await openProductStateDb();const values=await new Promise((resolve,reject)=>{const tx=db.transaction('boxes','readonly');const req=tx.objectStore('boxes').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});db.close();return values}catch(e){return []}}
async function getProductImageForSave(product){if(product.__pendingImageBlob instanceof Blob)return product.__pendingImageBlob;return await loadProductImage(product.dataset.productKey)}
async function applyBoxSnapshot(snapshot){
  if(!snapshot||!snapshot.boxKey)return;
  const box=document.querySelector('.box[data-box-key="'+CSS.escape(snapshot.boxKey)+'"]');if(!box)return;
  const items=Array.isArray(snapshot.products)?snapshot.products:[];
  for(const item of items){
    if(!item||!item.key)continue;
    let product=document.querySelector('.product[data-product-key="'+CSS.escape(item.key)+'"]');
    if(item.deleted){if(product)product.remove();continue}
    if(!product){
      const temp=document.createElement('div');temp.innerHTML=Product({key:item.key,title:item.title||'새 제품',sub:item.sub||'제품 설명',note:item.note||'사용 방법'});
      product=temp.firstElementChild;
      const anchor=box.querySelector('.product-prep-status')||box.querySelector('.box-save-button')||box.querySelector('.add-product-button');
      box.insertBefore(product,anchor||null);
    }
    if(item.title)product.querySelector('.name').textContent=item.title;
    if(item.sub)product.querySelector('.sub').textContent=item.sub;
    if(item.note)product.querySelector('.note').textContent=item.note;
    bindDynamicProduct(product);
    if(item.imageBlob instanceof Blob){product.__pendingImageBlob=item.imageBlob;applyProductImage(product,item.imageBlob)}
    else{const image=await loadProductImage(item.key);if(image)applyProductImage(product,image)}
  }
  const anchor=box.querySelector('.product-prep-status')||box.querySelector('.box-save-button')||box.querySelector('.add-product-button');
  const ordered=[...box.querySelectorAll('.product')].sort((a,b)=>{const ai=items.findIndex(x=>x&&x.key===a.dataset.productKey);const bi=items.findIndex(x=>x&&x.key===b.dataset.productKey);return(ai<0?9999:ai)-(bi<0?9999:bi)});
  ordered.forEach(p=>box.insertBefore(p,anchor||null));
}
async function saveBoxState(box){
  if(!box)return;
  const boxKey=box.dataset.boxKey;if(!boxKey)return;
  const allMeta=await metaAll();
  const deleted=allMeta.filter(item=>item&&item.deleted&&String(item.boxKey||'')===String(boxKey));
  const products=[...box.querySelectorAll('.product')];
  const items=[];
  for(let i=0;i<products.length;i++){
    const product=products[i],info=getProductInfo(product);info.order=i;info.deleted=false;
    const imageBlob=await getProductImageForSave(product);
    items.push({...info,imageBlob:imageBlob||null});
  }
  const keys=new Set(items.map(item=>item.key));
  for(const item of deleted){if(!keys.has(item.key))items.push({...item,deleted:true,imageBlob:null})}
  await statePut(boxKey,{boxKey,savedAt:Date.now(),products:items});
  for(const item of items){const meta={...item};delete meta.imageBlob;await metaPut(item.key,meta)}
  const btn=box.querySelector('.box-save-button');
  if(btn){btn.classList.add('saved');btn.textContent='SAVED ✓';clearTimeout(btn.__saveTimer);btn.__saveTimer=setTimeout(()=>{btn.classList.remove('saved');btn.textContent='SAVE'},1600)}
}
function initBoxSaveButtons(){
  document.querySelectorAll('.box').forEach(box=>{
    if(box.querySelector('.box-save-button'))return;
    const button=document.createElement('button');button.type='button';button.className='box-save-button';button.textContent='SAVE';
    button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();saveBoxState(box)});
    box.appendChild(button);
  });
}
const PRODUCT_META_DB='detailing-product-custom-v2';
function openProductMetaDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PRODUCT_META_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('items'))req.result.createObjectStore('items')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function metaPut(key,value){try{const db=await openProductMetaDb();await new Promise((resolve,reject)=>{const tx=db.transaction('items','readwrite');tx.objectStore('items').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(e){console.warn('meta save failed',e)}}
async function metaGet(key){try{const db=await openProductMetaDb();const value=await new Promise((resolve,reject)=>{const tx=db.transaction('items','readonly');const req=tx.objectStore('items').get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)});db.close();return value}catch(e){return null}}
async function metaAll(){try{const db=await openProductMetaDb();const values=await new Promise((resolve,reject)=>{const tx=db.transaction('items','readonly');const req=tx.objectStore('items').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});db.close();return values}catch(e){return []}}
function makeProductKey(){return 'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function getProductInfo(product){return{key:product.dataset.productKey,title:product.querySelector('.name')?.textContent||'새 제품',sub:product.querySelector('.sub')?.textContent||'제품 설명',note:product.querySelector('.note')?.textContent||'사용 방법',boxKey:product.closest('.box')?.dataset.boxKey||'',order:[...product.closest('.box')?.querySelectorAll('.product')||[]].indexOf(product),deleted:false}}
function updateDynamicPrep(section){if(!section)return;const products=[...section.querySelectorAll('.product')];const ready=products.filter(p=>p.classList.contains('is-ready')).length;const sectionStatus=section.querySelector('.section-prep-status');if(sectionStatus){sectionStatus.textContent=products.length&&ready===products.length?'✓ 제품 준비 완료':'제품 준비 '+ready+' / '+products.length;sectionStatus.classList.toggle('complete',products.length>0&&ready===products.length)}section.querySelectorAll('.box').forEach(box=>{const list=[...box.querySelectorAll('.product')];const status=box.querySelector('.product-prep-status');if(!status)return;const count=list.filter(p=>p.classList.contains('is-ready')).length;status.textContent=list.length&&count===list.length?'✓ 준비 완료':'준비 '+count+' / '+list.length;status.classList.toggle('complete',list.length>0&&count===list.length)})}
function bindEditableFields(product){if(product.dataset.editFieldsBound==='1')return;product.dataset.editFieldsBound='1';product.querySelectorAll('[data-edit-field]').forEach(field=>{field.addEventListener('click',async e=>{e.stopPropagation();e.preventDefault();const type=field.dataset.editField;const label=type==='title'?'제품 이름':type==='sub'?'제품 설명':'사용 메모';const value=prompt(label,field.textContent);if(value===null)return;const next=value.trim();if(!next)return;field.textContent=next;await metaPut(product.dataset.productKey,getProductInfo(product))})})}
async function deleteProduct(product){if(!product)return;const key=product.dataset.productKey;if(!key)return;const name=product.querySelector('.name')?.textContent||'제품';if(!confirm(`"${name}" 제품을 삭제할까요?`))return;const info=getProductInfo(product);info.deleted=true;info.order=[...product.closest('.box')?.querySelectorAll('.product')||[]].indexOf(product);await persistProductRecord({...info,imageBlob:null});product.remove();updateDynamicPrep(product.closest('.section'))}
const PRODUCT_PERSIST_DB='detailing-product-persist-v1';
function openProductPersistDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(PRODUCT_PERSIST_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('products'))req.result.createObjectStore('products');};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function persistProductRecord(record){try{const db=await openProductPersistDb();await new Promise((resolve,reject)=>{const tx=db.transaction('products','readwrite');tx.objectStore('products').put(record,record.key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();return true}catch(e){console.warn('product persist failed',e);return false}}
async function loadPersistedProductRecords(){try{const db=await openProductPersistDb();const values=await new Promise((resolve,reject)=>{const tx=db.transaction('products','readonly');const req=tx.objectStore('products').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)});db.close();return values}catch(e){return []}}
async function saveOneProduct(product){if(!product)return false;const info=getProductInfo(product);const imageBlob=await getProductImageForSave(product);info.order=[...product.closest('.box')?.querySelectorAll('.product')||[]].indexOf(product);info.deleted=false;const ok=await persistProductRecord({...info,imageBlob:imageBlob||null});if(imageBlob instanceof Blob)await saveProductImage(info.key,imageBlob);const btn=product.querySelector('.product-save-button');if(btn){clearTimeout(btn.__saveTimer);btn.classList.toggle('saved',ok);btn.textContent=ok?'SAVED ✓':'SAVE';btn.__saveTimer=setTimeout(()=>{btn.classList.remove('saved');btn.textContent='SAVE'},1500)}return ok}
function bindProductSave(product){const btn=product.querySelector('.product-save-button');if(!btn||product.dataset.productSaveBound==='1')return;product.dataset.productSaveBound='1';btn.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();await saveOneProduct(product)})}
function bindDynamicProduct(product){if(!product)return;bindEditableFields(product);bindProductUpload(product);bindProductSave(product);const del=product.querySelector('.product-delete');if(del&&product.dataset.deleteBound!=='1'){product.dataset.deleteBound='1';del.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();deleteProduct(product)})}if(product.dataset.dynamicPrepBound!=='1'&&product.dataset.prepBound!=='1'){product.dataset.dynamicPrepBound='1';product.addEventListener('click',e=>{if(e.target.closest('[data-upload-art],[data-edit-field],.product-file-input,.product-delete'))return;e.stopPropagation();const ready=product.classList.toggle('is-ready');product.setAttribute('aria-pressed',ready?'true':'false');const toggle=product.querySelector('.product-toggle');if(toggle)toggle.textContent=ready?'ON ✓':'OFF';updateDynamicPrep(product.closest('.section'))})}}
function initProductBoxKeys(){sections.forEach((section,si)=>section.querySelectorAll('.box').forEach((box,bi)=>{box.dataset.boxKey=String(si+1)+'-'+String(bi+1)}))}
async function migrateLegacyProductState(){const existing=await loadPersistedProductRecords();const known=new Set(existing.map(r=>r&&r.key).filter(Boolean));try{const legacy=await stateAll();for(const snap of legacy){if(!snap||!snap.boxKey||!Array.isArray(snap.products))continue;for(const item of snap.products){if(!item||!item.key||known.has(item.key))continue;await persistProductRecord({...item,boxKey:snap.boxKey,deleted:!!item.deleted,imageBlob:item.imageBlob instanceof Blob?item.imageBlob:null});known.add(item.key)}}}catch(e){}return await loadPersistedProductRecords()}
async function restoreCustomProducts(){
  const records=await migrateLegacyProductState();
  const byBox=new Map();
  records.forEach(r=>{if(!r||!r.key||!r.boxKey)return;const k=String(r.boxKey);if(!byBox.has(k))byBox.set(k,[]);byBox.get(k).push(r)});
  for(const [boxKey,itemsRaw] of byBox){
    const box=document.querySelector('.box[data-box-key="'+CSS.escape(boxKey)+'"]');if(!box)continue;
    const items=itemsRaw.slice().sort((a,b)=>Number(a.order??999999)-Number(b.order??999999));
    for(const item of items){
      let product=document.querySelector('.product[data-product-key="'+CSS.escape(item.key)+'"]');
      if(item.deleted){if(product)product.remove();continue}
      if(!product){
        const temp=document.createElement('div');temp.innerHTML=Product({key:item.key,title:item.title||'새 제품',sub:item.sub||'제품 설명',note:item.note||'사용 방법'});
        product=temp.firstElementChild;
        box.insertBefore(product,box.querySelector('.product-prep-status')||box.querySelector('.add-product-button')||null);
      }
      if(item.title!=null)product.querySelector('.name').textContent=item.title;
      if(item.sub!=null)product.querySelector('.sub').textContent=item.sub;
      if(item.note!=null)product.querySelector('.note').textContent=item.note;
      bindDynamicProduct(product);
      if(item.imageBlob instanceof Blob)applyProductImage(product,item.imageBlob);
      else {const image=await loadProductImage(item.key);if(image)applyProductImage(product,image)}
    }
    const anchor=box.querySelector('.product-prep-status')||box.querySelector('.add-product-button')||null;
    const products=[...box.querySelectorAll('.product')];
    const orderMap=new Map(items.map((item,i)=>[item.key,i]));
    products.sort((a,b)=>(orderMap.has(a.dataset.productKey)?orderMap.get(a.dataset.productKey):999999)-(orderMap.has(b.dataset.productKey)?orderMap.get(b.dataset.productKey):999999));
    products.forEach(p=>box.insertBefore(p,anchor));
  }
  sections.forEach(updateDynamicPrep);
}

function initExistingProductEditing(){document.querySelectorAll('.product').forEach(product=>bindDynamicProduct(product))}
function addProductToBox(box){const data={key:makeProductKey(),title:'새 제품',sub:'제품 설명',note:'사용 방법',boxKey:box.dataset.boxKey,deleted:false};const temp=document.createElement('div');temp.innerHTML=Product(data);const product=temp.firstElementChild;box.insertBefore(product,box.querySelector('.product-prep-status')||box.querySelector('.add-product-button')||null);bindDynamicProduct(product);updateDynamicPrep(box.closest('.section'));setTimeout(()=>product.querySelector('.name')?.click(),100)}
function initProductAddButtons(){document.querySelectorAll('.box').forEach(box=>{if(box.querySelector('.add-product-button'))return;const button=document.createElement('button');button.type='button';button.className='add-product-button';button.textContent='＋ 제품 추가';button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();addProductToBox(box)});box.appendChild(button)})}
async function saveAllProductChanges(){for(const product of document.querySelectorAll('.product'))await saveOneProduct(product)}
initProductBoxKeys();
initBoxSaveButtons();
initExistingProductEditing();
initProductAddButtons();
restoreCustomProducts();
function stagesFor(section){return[...section.querySelectorAll('.flowline > .pill, .flowline > .box')]}function clearStage(){sections.forEach(s=>s.querySelectorAll('.is-current,.is-done').forEach(el=>el.classList.remove('is-current','is-done')));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());activeStage=null;stageTimerValue=null;stageStart=null;clearInterval(stageTimerId);stageTimerId=null;if(timerValue)timerValue.textContent='00:00'}function formatTime(ms){const sec=Math.max(0,Math.floor(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0')}function updateTotalTimer(){if(!sessionStart||!topTimer)return;topTimer.textContent=formatTime(Date.now()-sessionStart)}function updateStageTimer(){if(!stageStart||!stageTimerValue)return;stageTimerValue.textContent=formatTime(Date.now()-stageStart)}function startTotalTimer(){clearInterval(timerId);updateTotalTimer();timerId=setInterval(updateTotalTimer,250)}function startStageTimer(){clearInterval(stageTimerId);updateStageTimer();stageTimerId=setInterval(updateStageTimer,250)}function selectStage(stage){const all=sections.flatMap(s=>stagesFor(s)),idx=all.indexOf(stage);if(idx<0)return;const wasCurrent=stage.classList.contains('is-current');if(wasCurrent){all.forEach(el=>el.classList.remove('is-current','is-done'));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());activeStage=null;stageTimerValue=null;stageStart=null;clearInterval(stageTimerId);stageTimerId=null;if(timerValue)timerValue.textContent='00:00';return}all.forEach(el=>el.classList.remove('is-current','is-done'));all.slice(0,idx).forEach(el=>el.classList.add('is-done'));document.querySelectorAll('.stage-inline-timer').forEach(el=>el.remove());stage.classList.add('is-current');const timer=document.createElement('span');timer.className='stage-inline-timer';timer.innerHTML='<span class="stage-timer-label">진행</span><span class="stage-timer-dot">●</span><strong>00:00</strong>';stage.insertAdjacentElement('afterend',timer);stageTimerValue=timer.querySelector('strong');stageStart=Date.now();startStageTimer();const sectionIndex=sections.findIndex(s=>s.contains(stage));if(sectionIndex>=0)setCurrentSection(sectionIndex);stage.scrollIntoView({behavior:'smooth',block:'center'})}function bindStageClicks(){sections.forEach(section=>stagesFor(section).forEach(stage=>stage.addEventListener('click',()=>selectStage(stage))))}bindStageClicks();document.getElementById('resetTotalTimer')?.addEventListener('click',()=>{
  sessionStart=Date.now();
  window.detailingStartAt=sessionStart;
  startTotalTimer();
});
if(sessionStart)startTotalTimer();function renderSide(){side.innerHTML=sections.map((s,i)=>`<button aria-label="${s.dataset.title}" data-i="${i}" class="${i===0?'active':''}">${String(i+1).padStart(2,'0')}</button>`).join('');side.querySelectorAll('button').forEach(b=>b.onclick=()=>scrollToSection(+b.dataset.i))}
function scrollToSection(i){if(i<0||i>=sections.length)return;const top=sections[i].getBoundingClientRect().top+window.scrollY-60;window.scrollTo({top:Math.max(0,top),behavior:'smooth'})}
function setCurrentSection(i){if(i<0||i>=sections.length)return;current=i;num.textContent=String(i+1).padStart(2,'0');navTitle.textContent=sections[i].dataset.title;navCount.textContent=`${String(i+1).padStart(2,'0')} / ${String(sections.length).padStart(2,'0')}`;side.querySelectorAll('button').forEach((b,n)=>b.classList.toggle('active',n===i))}
function updateSectionFromScroll(){const probe=window.innerHeight*.42;let best=0,bestScore=-Infinity;sections.forEach((s,i)=>{const r=s.getBoundingClientRect();const top=Math.max(r.top,0),bottom=Math.min(r.bottom,window.innerHeight);const visible=Math.max(0,bottom-top);const center=(r.top+r.bottom)/2;const score=visible-Math.abs(center-probe)*.12;if(score>bestScore){bestScore=score;best=i}});if(best!==current){current=best;setCurrentSection(best)}else setCurrentSection(current)}
function updateGauge(){const max=document.documentElement.scrollHeight-window.innerHeight;const p=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;document.documentElement.style.setProperty('--scroll-progress',p)}
let ticking=false;
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateSectionFromScroll();updateGauge();ticking=false});ticking=true}},{passive:true});
document.getElementById('next').onclick=()=>{const n=Math.min(sections.length-1,current+1);scrollToSection(n)};
document.getElementById('prev').onclick=()=>{const n=Math.max(0,current-1);sections[n].scrollIntoView({behavior:'smooth',block:'start'})};
renderSide();updateSectionFromScroll();updateGauge();