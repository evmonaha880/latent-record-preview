(function(){
var m=/image=(latent|steps)/.exec(location.search);if(!m)return;var mode=m[1];
document.body.classList.add('lm-'+mode);
var ph=document.querySelector('.photo'),img=document.getElementById('ph'),cap=ph.querySelector('figcaption');
img.style.display='none';
var fz=/freeze=(\d)/.exec(location.search);
var wrap=document.createElement('div');wrap.className='lm';ph.insertBefore(wrap,cap);
function stackOf(prefix,ext,cls){var d=document.createElement('div');d.className='stk '+cls;for(var k=0;k<8;k++){var i=document.createElement('img');i.src='assets/'+prefix+'_'+k+'.'+ext+'?v='+Date.now();i.style.opacity=k===0?1:0;d.appendChild(i)}return d}
var cur=0,stks=[],lab=null;
function show(n){cur=n;stks.forEach(function(s){[].forEach.call(s.children,function(im,k){im.style.opacity=k===n?1:0})});if(lab)lab.textContent=n===0?'Waiting':(n===7?'Final step (7 of 30 shown)':'Step '+[0,1,4,9,15,22,28,30][n]+' of 30 (7 of 30 shown)')}
if(mode==='latent'){
 wrap.innerHTML='<span class="mk">MOCK-UP</span><div class="lt1">What the model works on</div>';
 var t=stackOf('lt','png','tile');wrap.appendChild(t);
 var s1=document.createElement('div');s1.className='lt2';s1.textContent='Numbers drawn as color. Not a picture.';wrap.appendChild(s1);
 var ar=document.createElement('div');ar.className='ar';ar.textContent='decoded into';wrap.appendChild(ar);
 var p=stackOf('pv','jpg','prev');wrap.appendChild(p);
 lab=document.createElement('div');lab.className='lt2';wrap.appendChild(lab);stks=[t,p];
 cap.innerHTML='<b>AI-made image, openly labeled</b>The model cleans random noise into a small grid of numbers; a decoder turns the grid into a new portrait. Mock-up: the real version uses captured steps.';
}else{
 wrap.innerHTML='<span class="mk">MOCK-UP</span>';
 var d=stackOf('dn','jpg','full');wrap.appendChild(d);stks=[d];
 var bar=document.createElement('div');bar.className='sbar';lab=document.createElement('span');bar.appendChild(lab);wrap.appendChild(bar);
 cap.innerHTML='<b>AI-made image, openly labeled</b>Each step is a new guess, not a reveal. Mock-up: the real version uses captured steps from an open model.';
}
show(0);
window.onBeat=function(n){if(fz)return;show(Math.max(0,Math.min(7,n)))};
if(fz){show(+fz[1])}
})();
