var listEl=document.getElementById('list');
var detailEl=document.getElementById('detail');
var search=document.getElementById('search');

var all=[];
var audioList=[];
var currentAudio=null;
var indexPlay=0;
var raf;
var currentPlayIndex=-1;
var isPlayingAll=false;
var selectedSurahId=null;
var currentSurahName='';

setListStatus('Memuat daftar surah...');
fetchJson('https://api.quran.com/api/v4/chapters')
.then(function(d){
all=d.chapters||[];
render(all,{clearDetail:true});
})
.catch(function(){
setListStatus('Gagal memuat daftar surah. Coba refresh halaman.', true);
});

function fetchJson(url){
return fetch(url).then(function(r){
if(!r.ok){ throw new Error('Request gagal'); }
return r.json();
});
}

function setListStatus(message,isError){
let html='';
if(isError){
html='<div class="status-box error"><button onclick="loadChapters()">Coba Lagi</button>'+message+'</div>';
}else{
html='<div>'+message+'</div>';
}
listEl.innerHTML=html;
detailEl.innerHTML='';
selectedSurahId=null;
}

function loadChapters(){
setListStatus('Memuat...');
fetchJson('https://api.quran.com/api/v4/chapters')
.then(d=>{
all=d.chapters||[];
render(all,{clearDetail:true});
})
.catch(()=>setListStatus('Gagal',true));
}

function setDetailStatus(msg){
detailEl.innerHTML='<div>'+msg+'</div>';
}

function escapeHtml(v){
return String(v||'')
.replace(/&/g,'&amp;')
.replace(/</g,'&lt;')
.replace(/>/g,'&gt;')
.replace(/"/g,'&quot;')
.replace(/'/g,'&#39;');
}

function cleanTranslation(v){
var t=String(v||'').replace(/<[^>]*>/g,' ').trim();
var tx=document.createElement('textarea');
tx.innerHTML=t;
return tx.value;
}

//////////////////////////////////////////////////
// 🔥 SHARE AYAT (FIXED NO BUG)
//////////////////////////////////////////////////

let currentShareData=null;

function shareAyat(i){
const el=document.getElementById('ayat-'+i);
if(!el)return;

currentShareData={
arab:el.querySelector('.arab').innerText,
arti:el.querySelector('.arti').innerText,
surah:currentSurahName,
ayat:i+1
};

openShareModal();
}

function openShareModal(){
let modal=document.getElementById('shareModal');

if(!modal){
modal=document.createElement('div');
modal.id='shareModal';
modal.className='share-modal';

modal.innerHTML=`
<div class="share-panel">
<h3>Bagikan Ayat</h3>
<canvas id="shareCanvas" width="1080" height="1080"></canvas>
<div id="shareLoading">Loading...</div>
<div>
<button onclick="downloadShareImage()">Download</button>
<button onclick="shareNative()">Share</button>
<button onclick="closeShareModal()">Tutup</button>
</div>
</div>
`;

document.body.appendChild(modal);
}

modal.classList.add('open');

setTimeout(()=>generateImage(),100);
}

function closeShareModal(){
const m=document.getElementById('shareModal');
if(m)m.classList.remove('open');
}

function generateImage(){
if(!currentShareData)return;

const canvas=document.getElementById('shareCanvas');
if(!canvas)return;

const ctx=canvas.getContext('2d');

ctx.fillStyle='#08110f';
ctx.fillRect(0,0,1080,1080);

ctx.fillStyle='#e8c77a';
ctx.font='bold 50px Arial';
ctx.textAlign='center';

ctx.fillText(currentShareData.surah,540,120);
ctx.fillText('Ayat '+currentShareData.ayat,540,180);

ctx.fillStyle='#fff';
ctx.font='40px serif';
wrapText(ctx,currentShareData.arab,1000,300,800,'right');

ctx.fillStyle='#ccc';
ctx.font='24px Arial';
wrapText(ctx,currentShareData.arti,80,600,800,'left');
}

function wrapText(ctx,text,x,y,maxWidth,align){
ctx.textAlign=align;
const words=text.split(' ');
let line='';
let h=40;

for(let n=0;n<words.length;n++){
let test=line+words[n]+' ';
let w=ctx.measureText(test).width;

if(w>maxWidth && n>0){
ctx.fillText(line,x,y);
line=words[n]+' ';
y+=h;
}else{
line=test;
}
}
ctx.fillText(line,x,y);
}

function downloadShareImage(){
const c=document.getElementById('shareCanvas');
if(!c)return;
const a=document.createElement('a');
a.download='ayat.png';
a.href=c.toDataURL();
a.click();
}

function shareNative(){
const c=document.getElementById('shareCanvas');

if(navigator.share){
c.toBlob(b=>{
const f=new File([b],'ayat.png',{type:'image/png'});
navigator.share({files:[f]});
});
}else{
downloadShareImage();
}
}

//////////////////////////////////////////////////
// 🔥 SURAH
//////////////////////////////////////////////////

function render(data){
var html='<div class="list-grid">';

for(var i=0;i<data.length;i++){
html+=`
<button onclick="loadSurah(${data[i].id})">
${data[i].id}. ${data[i].name_simple}
</button>`;
}

html+='</div>';
listEl.innerHTML=html;
}

function loadSurah(id){
setDetailStatus('Loading...');

Promise.all([
fetchJson('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number='+id),
fetchJson('https://api.quran.com/api/v4/quran/translations/33?chapter_number='+id)
])
.then(res=>{

var arab=res[0].verses||[];
var arti=res[1].translations||[];

currentSurahName='Surah '+id;

var html='';

for(var i=0;i<arab.length;i++){
html+=`
<div id="ayat-${i}">
<div class="arab">${escapeHtml(arab[i].text_uthmani)}</div>
<div class="arti">${escapeHtml(cleanTranslation(arti[i].text))}</div>
<button onclick="shareAyat(${i})">📤 Bagikan</button>
</div>
`;
}

detailEl.innerHTML=html;

/* 🔥 FIX: JANGAN DUPLIKAT MODAL */
if(!document.getElementById('shareModal')){
openShareModal();
closeShareModal();
}

});
}
