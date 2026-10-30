const DARICA = {center:[29.3708,40.7736], zoom:13.45, pitch:57, bearing:-22};
const $ = id => document.getElementById(id);
const toast = (msg) => { const el=$('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2600); };
const map = new maplibregl.Map({
  container:'map',
  style:'https://tiles.openfreemap.org/styles/liberty',
  center:DARICA.center, zoom:DARICA.zoom, pitch:DARICA.pitch, bearing:DARICA.bearing,
  maxPitch:70, minZoom:10, maxZoom:19,
  attributionControl:false,
  cooperativeGestures:false
});
map.addControl(new maplibregl.AttributionControl({compact:true}), 'bottom-right');
let tilted=true;
map.on('load',()=>{
  // OpenFreeMap's OpenMapTiles-compatible building source provides real building footprints.
  const style=map.getStyle();
  const sourceId=Object.keys(style.sources||{}).find(k=>style.sources[k].url || style.sources[k].tiles);
  if(sourceId){
    const layers=map.getStyle().layers||[];
    const labelLayer=layers.find(l=>l.type==='symbol' && l.layout && l.layout['text-field']);
    const beforeId=labelLayer?labelLayer.id:undefined;
    try{
      map.addLayer({
        id:'darica-3d-buildings', source:sourceId, 'source-layer':'building', type:'fill-extrusion',
        minzoom:13,
        filter:['!=',['get','hide_3d'],true],
        paint:{
          'fill-extrusion-color':['interpolate',['linear'],['coalesce',['get','render_height'],['get','height'],8],0,'#d8d6c9',12,'#c7c9b9',30,'#aeb9a9',65,'#899e91'],
          'fill-extrusion-height':['interpolate',['linear'],['zoom'],13,0,14,['coalesce',['get','render_height'],['get','height'],8]],
          'fill-extrusion-base':['coalesce',['get','render_min_height'],['get','min_height'],0],
          'fill-extrusion-opacity':0.94,
          'fill-extrusion-vertical-gradient':true
        }
      },beforeId);
    }catch(e){console.warn('3D building layer could not be added',e);}
  }
  $('loading').classList.add('done');
  toast('Darıca haritası hazır · Yakınlaştırarak 3D binaları keşfet');
});
map.on('error',e=>{console.warn(e.error||e); if(e.error && String(e.error.message||'').includes('fetch')) toast('Harita verisi yüklenirken bağlantı sorunu yaşandı.');});
map.on('moveend',()=>{$('zoomLabel').textContent='ZOOM '+map.getZoom().toFixed(1);});
$('zoomIn').onclick=()=>map.zoomIn({duration:350});
$('zoomOut').onclick=()=>map.zoomOut({duration:350});
$('reset').onclick=()=>map.easeTo({...DARICA,duration:800});
$('district').onclick=()=>map.easeTo({...DARICA,duration:1000});
$('tilt').onclick=()=>{tilted=!tilted;map.easeTo({pitch:tilted?57:0,bearing:tilted?-22:0,duration:700});};
$('locate').onclick=()=>{
  if(!navigator.geolocation){toast('Bu cihaz konum paylaşımını desteklemiyor.');return;}
  navigator.geolocation.getCurrentPosition(p=>map.flyTo({center:[p.coords.longitude,p.coords.latitude],zoom:16,pitch:57,duration:1200}),()=>toast('Konum izni verilmedi veya konum alınamadı.'),{enableHighAccuracy:true,timeout:10000});
};
async function searchPlaces(){
  const q=$('search').value.trim(); if(!q)return;
  const query=/darıca/i.test(q)?q:`${q}, Darıca, Kocaeli, Türkiye`;
  $('results').classList.remove('hidden'); $('results').innerHTML='<button>Aranıyor…</button>';
  try{
    const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=tr&q='+encodeURIComponent(query);
    const r=await fetch(url,{headers:{'Accept-Language':'tr'}}); if(!r.ok)throw new Error('search');
    const data=await r.json();
    $('results').innerHTML='';
    if(!data.length){$('results').innerHTML='<button>Sonuç bulunamadı.<small>Başka bir mahalle veya sokak deneyin.</small></button>';return;}
    data.forEach(item=>{
      const b=document.createElement('button'); b.textContent=item.name||item.display_name.split(',')[0];
      const small=document.createElement('small'); small.textContent=item.display_name; b.appendChild(small);
      b.onclick=()=>{map.flyTo({center:[+item.lon,+item.lat],zoom:16.5,pitch:57,bearing:-22,duration:1400});$('results').classList.add('hidden');$('search').blur();};
      $('results').appendChild(b);
    });
  }catch(e){$('results').innerHTML='<button>Arama şu anda kullanılamıyor.<small>Bağlantınızı kontrol edip tekrar deneyin.</small></button>';}
}
$('searchBtn').onclick=searchPlaces;
$('search').addEventListener('keydown',e=>{if(e.key==='Enter')searchPlaces();if(e.key==='Escape')$('results').classList.add('hidden');});
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))$('results').classList.add('hidden');});
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('install').classList.remove('hidden');});
$('install').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('install').classList.add('hidden');};
if('serviceWorker' in navigator && location.protocol.startsWith('http')) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));