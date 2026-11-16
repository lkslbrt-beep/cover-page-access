/* CPA kinetic hero: juggler A (fire). Real footage, depth by scroll zoom and cursor light,
   tap = flame burst + sparks + whoosh. Starts on first interaction or 2.5 s idle. */
(function(){
var S=document.currentScript,B=S?S.src.replace(/[^/]*$/,''):'https://cpa-cta-juggler.netlify.app/';
var root=document.getElementById('cdk-jug');if(!root)return;
var mount=root.querySelector('[data-cxd3]'),snd=root.querySelector('.cxd3-snd');
var IT=/^\/it(\/|$)/.test(location.pathname);
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,PH=innerWidth<768;
var css=document.createElement('style');css.textContent=
'#cdk-jug .cj-v,#cdk-jug .cj-f,#cdk-jug .cj-c{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}'+
'#cdk-jug .cj-v{opacity:0;transition:opacity .6s;transform-origin:60% 55%}#cdk-jug .cj-v.on{opacity:1}'+
'#cdk-jug .cj-f{mix-blend-mode:screen;opacity:0;transition:opacity .5s}'+
'#cdk-jug .cj-l{position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px circle at var(--mx,70%) var(--my,50%),rgba(255,150,60,.22),transparent 60%);mix-blend-mode:screen}'+
'#cdk-jug .cxd3-tap{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:2px solid #f0874e;pointer-events:none;animation:cjTap .7s ease-out forwards;z-index:3}'+
'@keyframes cjTap{to{transform:scale(7);opacity:0}}'+
'#cdk-jug .cxd3-hint{position:absolute;z-index:3;pointer-events:none;width:56px;height:56px;margin:-28px 0 0 -28px}'+
'#cdk-jug .cxd3-hint i{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);animation:cjHint 1.6s ease-out infinite}'+
'#cdk-jug .cxd3-hint i+i{animation-delay:.5s}#cdk-jug .cxd3-hint b{position:absolute;top:62px;left:50%;transform:translateX(-50%);font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap}'+
'@keyframes cjHint{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}';
document.head.appendChild(css);
var v,f,c,ctx,parts=[],go=false,ac,taps=0,flash=0;
function el(t,cl){var e=document.createElement(t);e.className=cl;return e}
function start(){
 if(go)return;go=true;
 v=el('video','cj-v');v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';
 v.src=B+(PH?'fire-m.mp4':'fire.mp4');
 f=el('video','cj-f');f.muted=true;f.loop=true;f.playsInline=true;f.setAttribute('playsinline','');f.src=B+'flame.mp4';
 c=el('canvas','cj-c');ctx=c.getContext('2d');
 mount.appendChild(v);mount.appendChild(f);mount.appendChild(el('div','cj-l'));mount.appendChild(c);
 v.addEventListener('playing',function(){v.classList.add('on')},{once:true});
 v.play().catch(function(){});f.play().catch(function(){});
 size();addEventListener('resize',size);
 if(!RM)requestAnimationFrame(loop);
 hints();
}
function size(){var r=root.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,PH?1:1.5);c.width=r.width*d;c.height=r.height*d;ctx.setTransform(d,0,0,d,0,0)}
function loop(t){
 var r=root.getBoundingClientRect(),vh=innerHeight,p=Math.min(1,Math.max(0,1-r.bottom/(vh+r.height)));
 var vis=r.bottom>0&&r.top<vh;
 if(vis){
  var z=1.06+p*.12+flash*.04,rot=Math.sin(t/4000)*.4;
  v.style.transform='scale('+z+') rotate('+rot+'deg) translateY('+(p*-30)+'px)';
  f.style.opacity=Math.min(.85,.12+flash*.9);
  root.style.setProperty('--cxp',flash.toFixed(3));
  flash*=.92;
  ctx.clearRect(0,0,c.width,c.height);
  for(var i=parts.length-1;i>=0;i--){var q=parts[i];q.x+=q.vx;q.y+=q.vy;q.vy+=.06;q.l-=.016;
   if(q.l<=0){parts.splice(i,1);continue}
   ctx.fillStyle='rgba(255,'+(140+q.l*100|0)+',60,'+q.l+')';ctx.beginPath();ctx.arc(q.x,q.y,q.s*q.l,0,7);ctx.fill()}
  if(Math.random()<.25)burst(r.width*(.45+Math.random()*.4),r.height*(.35+Math.random()*.3),1,.6);
 }
 requestAnimationFrame(loop);
}
function burst(x,y,n,pw){for(var i=0;i<n;i++){var a=Math.random()*6.28,s=(1+Math.random()*4)*pw;parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2*pw,l:1,s:1.5+Math.random()*2.5})}}
function audio(){if(ac)return ac;var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A();return ac}
function whoosh(){
 if(!snd||snd.getAttribute('aria-pressed')!=='true')return;var a=audio();if(!a)return;
 var n=a.sampleRate*.6,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 var s=a.createBufferSource();s.buffer=b;var bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;
 bp.frequency.setValueAtTime(300,a.currentTime);bp.frequency.exponentialRampToValueAtTime(2400,a.currentTime+.25);bp.frequency.exponentialRampToValueAtTime(500,a.currentTime+.6);
 var g=a.createGain();g.gain.setValueAtTime(0,a.currentTime);g.gain.linearRampToValueAtTime(.9,a.currentTime+.08);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.6);
 s.connect(bp);bp.connect(g);g.connect(a.destination);s.start();
 var o=a.createOscillator(),og=a.createGain();o.type='sine';o.frequency.setValueAtTime(90,a.currentTime);o.frequency.exponentialRampToValueAtTime(40,a.currentTime+.3);
 og.gain.setValueAtTime(.5,a.currentTime);og.gain.exponentialRampToValueAtTime(.001,a.currentTime+.35);o.connect(og);og.connect(a.destination);o.start();o.stop(a.currentTime+.4);
}
function tap(e){
 if(e.target.closest('a,button'))return;start();
 var r=root.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 flash=1;burst(x,y,40,1.4);whoosh();
 var t=el('span','cxd3-tap');t.style.left=x+'px';t.style.top=y+'px';root.appendChild(t);setTimeout(function(){t.remove()},800);
 if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}
 if(++taps>=4)root.querySelectorAll('.cxd3-hint').forEach(function(h){h.remove()});
}
function hints(){
 if(RM)return;var lbl=IT?'tocca':'tap';
 (function one(){if(taps>=4||!document.contains(root))return;
  var h=el('span','cxd3-hint');h.innerHTML='<i></i><i></i><b>'+lbl+'</b>';
  h.style.left=(PH?55:55)+Math.random()*(PH?35:35)+'%';h.style.top=25+Math.random()*40+'%';
  root.appendChild(h);setTimeout(function(){h.remove()},1400);setTimeout(one,1400)})();
}
function setSnd(on){if(!snd)return;snd.setAttribute('aria-pressed',on?'true':'false');snd.querySelector('b').textContent=on?(IT?'Audio on · tocca il fuoco':'Sound on · tap the fire'):(IT?'Audio off':'Sound off');if(on){var a=audio();if(a&&a.state==='suspended')a.resume()}}
if(snd){setSnd(false);snd.addEventListener('click',function(e){e.stopPropagation();start();setSnd(snd.getAttribute('aria-pressed')!=='true');if(snd.getAttribute('aria-pressed')==='true'){flash=1;whoosh()}})}
root.addEventListener('pointerdown',tap);
root.addEventListener('pointermove',function(e){var r=root.getBoundingClientRect();root.style.setProperty('--mx',(e.clientX-r.left)+'px');root.style.setProperty('--my',(e.clientY-r.top)+'px')});
['pointermove','pointerdown','scroll','keydown','touchstart'].forEach(function(t){addEventListener(t,start,{once:true,passive:true})});
addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(start)},2500)});
})();
