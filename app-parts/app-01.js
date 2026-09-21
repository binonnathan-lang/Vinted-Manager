const KEY='vinted_manager_data_v1';
const uid=()=>{try{return crypto.randomUUID()}catch(e){return Date.now().toString(36)+Math.random().toString(36).slice(2)}};
const today=()=>new Date().toISOString().slice(0,10); const monthKey=d=>String(d).slice(0,7); const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString('fr-BE'):''; const euro=n=>(Number(n)||0).toLocaleString('fr-BE',{style:'currency',currency:'EUR'}); const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); const daysSince=d=>Math.max(0,Math.floor((new Date(today())-new Date((d||today())+'T12:00:00'))/86400000));
const demo={sales:[],expenses:[],stock:[],orders:[],goals:[],settings:{deadline:5,dark:false,reserve:50,initialCapital:0},version:7};
function makeDemo(){return JSON.parse(JSON.stringify(demo))}
let data;
try{
  const saved=localStorage.getItem(KEY);
  data=saved?JSON.parse(saved):makeDemo();
}catch(e){data=makeDemo()}
// Migration des anciennes données : on conserve tout ce qui existe déjà.
data.settings=data.settings||{};if(data.settings.initialCapital==null)data.settings.initialCapital=0;if(data.settings.deadline==null)data.settings.deadline=5;if(data.settings.reserve==null)data.settings.reserve=50;
data.sales=(data.sales||[]).map(x=>({...x,paymentStatus:x.paymentStatus||'En attente',paymentDate:x.paymentDate||''}));
data.capitalContributions=Array.isArray(data.capitalContributions)?data.capitalContributions:[];
data.people=Array.isArray(data.people)?data.people:[];data.personPayments=Array.isArray(data.personPayments)?data.personPayments:[];data.sales=(data.sales||[]).map(x=>({...x,beneficiaries:Array.isArray(x.beneficiaries)?x.beneficiaries:[]}));
const ORDER_STATUSES=['Nouvelle vente','À préparer','À emballer','À expédier','Expédiée','En transit','Livrée','Terminée','Problème'];
function syncOrderStatuses(){
  let changed=false;
  const used=new Set();
  (data.orders||[]).forEach(o=>{
    let sale=o.saleId?data.sales.find(s=>s.id===o.saleId):null;
    if(!sale){
      const candidates=data.sales.filter(s=>!used.has(s.id)&&s.item===o.item&&s.date===o.date);
      if(candidates.length===1){sale=candidates[0];o.saleId=sale.id;changed=true;}
    }
    if(sale){
      used.add(sale.id);
      const st=o.status||sale.status||'Nouvelle vente';
      if(sale.status!==st){sale.status=st;changed=true;}
      if(o.item!==sale.item){o.item=sale.item;changed=true;}
      if(o.date!==sale.date){o.date=sale.date;changed=true;}
    }
  });
  return changed;
}
syncOrderStatuses();
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));updateBadge();return true}catch(e){console.error('Sauvegarde locale impossible:',e);return false}}save();
let page='dashboard',search='',orderStatusFilter='',orderStatusFilters=['Nouvelle vente','À préparer','À emballer','À expédier','Expédiée','En transit'],orderPaymentFilters=['En attente','Argent reçu'],globalQ='';
let storageMapState=(()=>{try{return JSON.parse(localStorage.getItem('vinted_manager_storage_map')||'null')}catch(e){return null}})()||{zoom:1,items:[]};
function saveStorageMap(){try{localStorage.setItem('vinted_manager_storage_map',JSON.stringify(storageMapState))}catch(e){console.error(e)}}
function storageMap(v){let m=storageMapState;v.innerHTML=`<div class="toolbar"><button class="btn primary" onclick="addStorageShape()">＋ Ajouter une zone</button><button class="btn" onclick="storageZoom(-0.1)">−</button><b style="padding:8px 4px">${Math.round(m.zoom*100)}%</b><button class="btn" onclick="storageZoom(0.1)">＋</button><button class="btn" onclick="storageZoom(0.25)">🔍 Zoom +</button><button class="btn" onclick="storageZoom(-0.25)">🔎 Zoom −</button><button class="btn" onclick="resetStorageView()">↺ Réinitialiser</button></div><div class="card"><div class="section-title"><div><h2>🗺️ Plan de stockage libre</h2><p class="small">Ajoute autant de zones que tu veux, redimensionne-les et déplace-les librement. Les emplacements sont automatiquement proposés dans le Stock.</p></div><span class="pill purple">${m.items.length} zone(s)</span></div><div id="storageCanvas" style="position:relative;overflow:auto;height:620px;background-image:linear-gradient(#ddd 1px,transparent 1px),linear-gradient(90deg,#ddd 1px,transparent 1px);background-size:25px 25px;border:1px solid #ccc;border-radius:14px"><div style="position:relative;width:${Math.max(2200,1800*m.zoom)}px;height:${Math.max(1400,1100*m.zoom)}px;transform:scale(${m.zoom});transform-origin:0 0">${m.items.map(storageShapeHtml).join('')}</div></div></div>`}
function storageShapeHtml(z){let count=data.stock.filter(x=>x.location===z.name).length;return `<div class="storage-shape" data-id="${z.id}" style="position:absolute;left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px;background:rgba(120,140,180,.18);border:2px solid #555;border-radius:10px;box-sizing:border-box;cursor:move;user-select:none;padding:8px" onmousedown="startStorageDrag(event,'${z.id}')"><b>${esc(z.name)}</b><div style="font-size:11px;margin-top:5px">${count} article(s)</div><div style="font-size:10px;margin-top:4px;max-height:45px;overflow:hidden">${data.stock.filter(x=>x.location===z.name).slice(0,5).map(x=>esc(x.name)).join('<br>')}</div><div style="position:absolute;right:4px;top:3px;display:flex;gap:4px"><button class="btn small" style="padding:1px 5px" onclick="event.stopPropagation();editStorageShape('${z.id}')">✎</button><button class="btn small danger" style="padding:1px 5px" onclick="event.stopPropagation();deleteStorageShape('${z.id}')">×</button></div><div style="position:absolute;right:-5px;bottom:-5px;width:14px;height:14px;border:2px solid #555;border-radius:3px;background:#fff;cursor:nwse-resize" onmousedown="startStorageResize(event,'${z.id}')"></div></div>`}
function storageZoom(delta){storageMapState.zoom=Math.min(2.5,Math.max(.35,storageMapState.zoom+delta));saveStorageMap();render()}
function resetStorageView(){storageMapState.zoom=1;render()}
function addStorageShape(){let name=prompt('Nom de la zone (ex. B1, C1, Étagère A, Bac 4) :','B1');if(!name)return;storageMapState.items.push({id:uid(),name:name.trim(),x:80+storageMapState.items.length*30,y:80+storageMapState.items.length*25,w:220,h:120});saveStorageMap();render()}
function editStorageShape(id){let z=storageMapState.items.find(x=>x.id===id);if(!z)return;let name=prompt('Nom de la zone :',z.name);if(name===null)return;name=name.trim();if(!name)return;if(storageMapState.items.some(a=>a.id!==id&&a.name.toLowerCase()===name.toLowerCase())){alert('Ce nom d’emplacement existe déjà.');return}z.name=name;saveStorageMap();render()}
function deleteStorageShape(id){let z=storageMapState.items.find(x=>x.id===id);if(!z)return;let used=data.stock.filter(x=>x.location===z.name).length;if(used&&!confirm(`Cette zone contient ${used} article(s) dans le stock. Supprimer quand même ? Les articles garderont leur emplacement actuel.`))return;if(!used&&!confirm('Supprimer cette zone ?'))return;storageMapState.items=storageMapState.items.filter(x=>x.id!==id);saveStorageMap();render()}
function startStorageResize(e,id){e.stopPropagation();e.preventDefault();let z=storageMapState.items.find(x=>x.id===id);if(!z)return;let sx=e.clientX,sy=e.clientY,ow=z.w,oh=z.h;function move(ev){z.w=Math.max(100,ow+(ev.clientX-sx)/storageMapState.zoom);z.h=Math.max(70,oh+(ev.clientY-sy)/storageMapState.zoom);let el=document.querySelector(`[data-id="${id}"]`);if(el){el.style.width=z.w+'px';el.style.height=z.h+'px'}}function up(){saveStorageMap();document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up)}document.addEventListener('mousemove',move);document.addEventListener('mouseup',up)}
function startStorageDrag(e,id){if(e.button!==0||e.target.closest('[onclick*=editStorageShape]'))return;let z=storageMapState.items.find(x=>x.id===id);if(!z)return;let startX=e.clientX,startY=e.clientY,ox=z.x,oy=z.y;function move(ev){z.x=Math.max(0,ox+(ev.clientX-startX)/storageMapState.zoom);z.y=Math.max(0,oy+(ev.clientY-startY)/storageMapState.zoom);let el=document.querySelector(`[data-id="${id}"]`);if(el){el.style.left=z.x+'px';el.style.top=z.y+'px'}}function up(){saveStorageMap();document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up)}document.addEventListener('mousemove',move);document.addEventListener('mouseup',up)}

const navs=[['dashboard','⌂','Accueil'],['orders','▣','Commandes'],['people','👥','Argent à rendre'],['stock','□','Stock'],['storageMap','▦','Plan de stockage'],['aiStock','✨','Import IA'],['sales','€','Ventes'],['expenses','−','Dépenses'],['finance','◔','Finances'],['analytics','⌁','Analyses'],['opportunities','💡','Opportunités'],['goals','★','Objectifs'],['assistant','✦','Coach Vinted'],['labels','▤','Bordereaux'],['calendar','□','Calendrier'],['tasks','✓','Ma journée'],['settings','⚙','Réglages']];
