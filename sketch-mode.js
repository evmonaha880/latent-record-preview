(function(){
if(!/image=sketch/.test(location.search))return;
document.body.classList.add('sketchmode');
var ph=document.querySelector('.photo'),img=document.getElementById('ph'),cap=ph.querySelector('figcaption');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
img.src='assets/base.jpg';img.style.clipPath='inset(0 0 0 100%)';img.style.zIndex=2;img.style.filter='grayscale(1) contrast(1.05)';img.style.position='absolute';
var cv=document.createElement('canvas');cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1';ph.insertBefore(cv,img);
var seam=document.createElement('div');seam.style.cssText='position:absolute;top:0;bottom:0;width:3px;background:#D6221F;z-index:3;left:100%;opacity:0';ph.appendChild(seam);
var capSk='<b>George Eastman</b>1854 to 1932. Line drawing traced from his photograph.',capPh='<b>George Eastman</b>1854 to 1932. The photograph: a lens, light, a moment that happened.';cap.innerHTML=capSk;
var ctx=cv.getContext('2d'),S=null,W=600,H=800,sc=1,ox=0,oy=0,state=[],anim=0,raf=0;
function size(){var r=ph.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv.width=r.width*dpr;cv.height=r.height*dpr;sc=Math.max(r.width/W,r.height/H)*dpr;ox=(cv.width-W*sc)/2;oy=(cv.height-H*sc)/2;redraw()}
function seg(s,i){var a=s.p[i],b=s.p[i+1];ctx.beginPath();ctx.moveTo(ox+a[0]*sc,oy+a[1]*sc);ctx.lineTo(ox+b[0]*sc,oy+b[1]*sc);ctx.stroke()}
function pen(){ctx.strokeStyle='rgba(38,36,34,.9)';ctx.lineWidth=2.1*sc;ctx.lineCap='round';ctx.lineJoin='round'}
function redraw(){ctx.clearRect(0,0,cv.width,cv.height);if(!S)return;pen();S.strokes.forEach(function(s,k){var n=state[k]||0;for(var i=0;i<n&&i<s.p.length-1;i++)seg(s,i)})}
function finish(d){S.strokes.forEach(function(s,k){if(s.d<=d)state[k]=s.p.length-1});redraw()}
function setWipe(w){img.style.clipPath='inset(0 0 0 '+(100-w)+'%)';seam.style.left=(100-w)+'%';seam.style.opacity=(w>0&&w<100)?1:0}
function animate(d,T){cancelAnimationFrame(raf);var id=++anim;var list=S.strokes.map(function(s,k){return{s:s,k:k}}).filter(function(o){return o.s.d===d});
 var total=list.reduce(function(a,o){return a+o.s.l},0),t0=performance.now();pen();
 function frame(t){if(id!==anim)return;var p=Math.min(1,(t-t0)/T),target=p*total,acc=0;
  list.forEach(function(o){var s=o.s,k=o.k,segLen=s.l/Math.max(1,s.p.length-1);var want=Math.max(0,Math.min(s.p.length-1,Math.floor((target-acc)/segLen)));acc+=s.l;var have=state[k]||0;for(var i=have;i<want;i++)seg(s,i);if(want>have)state[k]=want});
  if(p<1)raf=requestAnimationFrame(frame);else{finish(d)}}
 raf=requestAnimationFrame(frame)}
function wipe(T){var id=++anim,t0=performance.now();(function f(t){if(id!==anim)return;var p=Math.min(1,(t-t0)/T);setWipe(100*(1-Math.pow(1-p,2)));if(p<1)requestAnimationFrame(f)})(t0)}
window.onBeat=function(n){if(!S)return;cancelAnimationFrame(raf);
 if(n===0){anim++;state=[];setWipe(0);redraw();cap.innerHTML=capSk;return}
 for(var d=1;d<n&&d<=6;d++)finish(d);
 if(n<=6){setWipe(0);if(reduce){finish(n)}else animate(n,6200)}
 else{finish(6);cap.innerHTML=capPh;if(reduce)setWipe(100);else wipe(4200)}};
// the page's own draft counter calls onBeat only for drafts 1-6; the published draft 7 arrives as beat 7
fetch('assets/strokes.json').then(function(r){return r.json()}).then(function(j){S=j;size();window.addEventListener('resize',size)});
})();
