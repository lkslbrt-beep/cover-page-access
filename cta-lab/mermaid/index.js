/* CPA kinetic hero: mermaid A (underwater stage). Real footage, caustic light, rising bubbles,
   touch = ripple + bubble burst + bloop, scroll = depth gauge and darker water, ambient sea hum when sound on. */
(function(){
var S=document.currentScript,B=S?S.src.replace(/[^/]*$/,''):'https://cpa-cta-mermaid.netlify.app/';
var root=document.getElementById('cdk-mer');if(!root)return;
var mount=root.querySelector('[data-cxd3]'),snd=root.querySelector('.cxd3-snd');
var IT=/^\/it(\/|$)/.test(location.pathname),RM=matchMedia('(prefers-reduced-motion: reduce)').matches,PH=innerWidth<768;
var css=document.createElement('style');css.textContent=
'#cdk-mer .cm-v,#cdk-mer canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}'+
'#cdk-mer .cm-v{opacity:0;transition:opacity .8s;transform-origin:60% 40%}#cdk-mer .cm-v.on{opacity:1}'+
'#cdk-mer .cm-c{mix-blend-mode:screen;opacity:.55}'+
'#cdk-mer .cm-l{position:absolute;inset:0;pointer-events:none;background:radial-gradient(520px 900px at var(--mx,70%) -10%,rgba(190,240,255,.28),transparent 60%);mix-blend-mode:screen}'+
'#cdk-mer .cm-d{position:absolute;inset:0;pointer-events:none;background:#020c14;opacity:var(--dp,0)}'+
'#cdk-mer .cm-g{position:absolute;right:9vw;top:50%;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:10px;font:700 10px/1 Inter,Arial,sans-serif;letter-spacing:2px;color:rgba(255,255,255,.75);pointer-events:none}'+
'#cdk-mer .cm-g i{display:block;width:1px;height:160px;background:linear-gradient(rgba(255,255,255,.1),rgba(255,255,255,.6),rgba(255,255,255,.1));position:relative}'+
'#cdk-mer .cm-g i b{position:absolute;left:-4px;top:var(--gp,0%);width:9px;height:9px;border-radius:50%;background:#e25b1e;box-shadow:0 0 12px #e25b1e}'+
'@media (max-width:767px){#cdk-mer .cm-g{right:14px;top:auto;bottom:120px;transform:none}#cdk-mer .cm-g i{height:90px}}'+
'#cdk-mer .cxd3-tap{position:absolute;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:1.5px solid rgba(220,250,255,.9);pointer-events:none;animation:cmRip 1.1s ease-out forwards;z-index:3}'+
'#cdk-mer .cxd3-tap+.cxd3-tap{animation-delay:.15s}@keyframes cmRip{0%{transform:scale(.3);opacity:1}100%{transform:scale(9);opacity:0}}'+
'#cdk-mer .cxd3-hint{position:absolute;z-index:3;pointer-events:none;width:56px;height:56px;margin:-28px 0 0 -28px}'+
'#cdk-mer .cxd3-hint i{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(220,250,255,.8);animation:cmHint 1.6s ease-out infinite}#cdk-mer .cxd3-hint i+i{animation-delay:.5s}'+
'#cdk-mer .cxd3-hint b{position:absolute;top:62px;left:50%;transform:translateX(-50%);font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap}'+
'@keyframes cmHint{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}'+
'@media (prefers-reduced-motion:reduce){#cdk-mer .cm-g{display:none}}';
document.head.appendChild(css);
var gauge=document.createElement('div');gauge.className='cm-g';gauge.setAttribute('aria-hidden','true');gauge.innerHTML='<span class="cm-gm">0 m</span><i><b></b></i><span>'+(IT?'profondità':'depth')+'</span>';root.appendChild(gauge);
var gm=gauge.querySelector('.cm-gm');
var v,cc,cx,bc,bx,go=false,ac,amb,taps=0,flash=0,bub=[],cw=96,chh=54,t0=performance.now();
function el(t,c){var e=document.createElement(t);e.className=c;return e}
function start(){
 if(go)return;go=true;
 v=el('video','cm-v');v.muted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.src=B+(PH?'sea-m.mp4':'sea.mp4');
 cc=el('canvas','cm-c');cc.width=cw;cc.height=chh;cx=cc.getContext('2d');
 bc=el('canvas','cm-b');bx=bc.getContext('2d');
 mount.appendChild(v);mount.appendChild(cc);mount.appendChild(el('div','cm-l'));mount.appendChild(el('div','cm-d'));mount.appendChild(bc);
 v.addEventListener('playing',function(){v.classList.add('on')},{once:true});v.play().catch(function(){});
 size();addEventListener('resize',size);
 for(var i=0;i<(PH?18:34);i++)bub.push(nb(Math.random()*innerWidth,Math.random()*800,0));
 if(!RM)requestAnimationFrame(loop);
 hints();
}
function size(){var r=root.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,PH?1:1.5);bc.width=r.width*d;bc.height=r.height*d;bx.setTransform(d,0,0,d,0,0)}
function nb(x,y,burst){return{x:x,y:y,r:burst?2+Math.random()*7:1+Math.random()*3.5,vy:-(burst?1.5+Math.random()*2.5:.3+Math.random()*.7),vx:burst?(Math.random()-.5)*3:0,w:Math.random()*6.28,a:burst?1:.35+Math.random()*.4,b:burst}}
var img;
function caustics(t){
 if(!img)img=cx.createImageData(cw,chh);var d=img.data,s=t*.0006;
 for(var y=0;y<chh;y++)for(var x=0;x<cw;x++){
  var u=x/cw*6,w=y/chh*4,c=Math.sin(u+s*3+Math.sin(w*1.7+s*2))+Math.sin(w*1.3-s*2.2+Math.sin(u*1.1+s))+Math.sin((u+w)*.9+s*1.6);
  c=Math.pow(Math.max(0,1-Math.abs(c)*.55),6)*255*(1-y/chh*.6)*(1+flash*.8);
  var i=(y*cw+x)*4;d[i]=c*.75;d[i+1]=c;d[i+2]=c;d[i+3]=255}
 cx.putImageData(img,0,0);
}
function loop(t){
 var r=root.getBoundingClientRect(),vh=innerHeight;
 if(r.bottom>0&&r.top<vh){
  var p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height)));
  v.style.transform='scale('+(1.05+p*.15+flash*.03)+') translateY('+(p*40)+'px)';
  root.style.setProperty('--dp',(p*.55).toFixed(3));root.style.setProperty('--gp',(p*100).toFixed(1)+'%');
  gm.textContent=Math.round(p*12)+' m';
  root.style.setProperty('--cxp',flash.toFixed(3));flash*=.94;
  caustics(t);
  bx.clearRect(0,0,r.width,r.height);
  if(Math.random()<.12)bub.push(nb(Math.random()*r.width,r.height+10,0));
  for(var i=bub.length-1;i>=0;i--){var q=bub[i];q.w+=.05;q.x+=q.vx+Math.sin(q.w)*.4;q.vx*=.96;q.y+=q.vy;if(q.b){q.a-=.006}
   if(q.y<-20||q.a<=0){bub.splice(i,1);continue}
   bx.beginPath();bx.arc(q.x,q.y,q.r,0,7);bx.strokeStyle='rgba(220,250,255,'+q.a+')';bx.lineWidth=1;bx.stroke();
   bx.beginPath();bx.arc(q.x-q.r*.35,q.y-q.r*.35,q.r*.3,0,7);bx.fillStyle='rgba(255,255,255,'+q.a*.8+')';bx.fill()}
 }
 requestAnimationFrame(loop);
}
function audio(){if(ac)return ac;var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A();return ac}
function on(){return snd&&snd.getAttribute('aria-pressed')==='true'}
function bloop(){
 if(!on())return;var a=audio();if(!a)return;var n=3+Math.floor(Math.random()*3);
 for(var k=0;k<n;k++){var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+k*.07+Math.random()*.03,f=300+Math.random()*500;
  o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.6,t+.09);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.35,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.12);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.15)}
 var N=a.sampleRate*.8,bf=a.createBuffer(1,N,a.sampleRate),dd=bf.getChannelData(0);for(var i=0;i<N;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/N,2);
 var s=a.createBufferSource();s.buffer=bf;var lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;var gg=a.createGain();gg.gain.value=.5;s.connect(lp);lp.connect(gg);gg.connect(a.destination);s.start();
}
function ambient(play){
 var a=audio();if(!a)return;
 if(play&&!amb){var N=a.sampleRate*4,bf=a.createBuffer(1,N,a.sampleRate),d=bf.getChannelData(0),l=0;for(var i=0;i<N;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3}
  var s=a.createBufferSource();s.buffer=bf;s.loop=true;var lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;var g=a.createGain();g.gain.value=.0001;
  var lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=.12;lg.gain.value=120;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  s.connect(lp);lp.connect(g);g.connect(a.destination);s.start();g.gain.exponentialRampToValueAtTime(.35,a.currentTime+1.5);amb={s:s,g:g}}
 else if(!play&&amb){amb.g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.6);var x=amb;setTimeout(function(){try{x.s.stop()}catch(_){}},700);amb=null}
}
function tap(e){
 if(e.target.closest('a,button'))return;start();
 var r=root.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 flash=1;for(var i=0;i<26;i++)bub.push(nb(x,y,1));bloop();
 for(var k=0;k<2;k++){var t=el('span','cxd3-tap');t.style.left=x+'px';t.style.top=y+'px';root.appendChild(t);(function(n){setTimeout(function(){n.remove()},1400)})(t)}
 if(navigator.vibrate)try{navigator.vibrate(10)}catch(_){}
 if(++taps>=4)root.querySelectorAll('.cxd3-hint').forEach(function(h){h.remove()});
}
function hints(){if(RM)return;var lbl=IT?'tocca':'tap';(function one(){if(taps>=4||!document.contains(root))return;var h=el('span','cxd3-hint');h.innerHTML='<i></i><i></i><b>'+lbl+'</b>';h.style.left=(52+Math.random()*30)+'%';h.style.top=(25+Math.random()*40)+'%';root.appendChild(h);setTimeout(function(){h.remove()},1400);setTimeout(one,1500)})()}
function setSnd(o){if(!snd)return;snd.setAttribute('aria-pressed',o?'true':'false');snd.querySelector('b').textContent=o?(IT?'Audio on · tocca l’acqua':'Sound on · touch the water'):(IT?'Audio off':'Sound off');if(o){var a=audio();if(a&&a.state==='suspended')a.resume()}ambient(o)}
if(snd){setSnd(false);snd.addEventListener('click',function(e){e.stopPropagation();start();setSnd(!on());if(on()){flash=1;bloop()}})}
root.addEventListener('pointerdown',tap);
root.addEventListener('pointermove',function(e){var r=root.getBoundingClientRect();root.style.setProperty('--mx',(e.clientX-r.left)+'px')});
['pointermove','pointerdown','scroll','keydown','touchstart'].forEach(function(t){addEventListener(t,start,{once:true,passive:true})});
addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(start)},2500)});
})();
