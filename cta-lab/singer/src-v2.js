/* CPA singer hero v2: real 3D stage in three.js. Editorial footage on a screen plane, a lighting truss with
   moving head lamps, volumetric beams (noise shader), 3D haze, bloom. Cursor aims the rig, tap = beat drop. Silent. */
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

(function(){
var S=document.currentScript,B=S?S.src.replace(/[^/]*$/,''):'https://cpa-cta-singer.netlify.app/';
var root=document.getElementById('cdk-sng');if(!root)return;
var mount=root.querySelector('[data-cxd3]');
var IT=/^\/it(\/|$)/.test(location.pathname),RM=matchMedia('(prefers-reduced-motion: reduce)').matches,PH=innerWidth<768;
if(RM)return;
var css=document.createElement('style');css.textContent=
'#cdk-sng [data-cxd3] canvas{position:absolute;inset:0;width:100%!important;height:100%!important;opacity:0;transition:opacity .6s}#cdk-sng [data-cxd3] canvas.on{opacity:1}'+
'#cdk-sng .cxd3-hint{position:absolute;z-index:3;pointer-events:none;width:56px;height:56px;margin:-28px 0 0 -28px}'+
'#cdk-sng .cxd3-hint i{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);animation:csHint 1.6s ease-out infinite}'+
'#cdk-sng .cxd3-hint i+i{animation-delay:.5s}#cdk-sng .cxd3-hint b{position:absolute;top:62px;left:50%;transform:translateX(-50%);font:700 9px/1 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;white-space:nowrap}'+
'@keyframes csHint{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.4);opacity:0}}';
document.head.appendChild(css);

var go=false,renderer,scene,cam,composer,bloom,video,screen,beams=[],heads=[],haze,taps=0,flash=0,sweep=0,vis=true,W=1,H=1;
var aim=new THREE.Vector2(.3,0),aimT=new THREE.Vector2(.3,0),t0=performance.now();

var beamV='varying vec3 vP;varying vec3 vN;varying vec3 vW;varying float vY;void main(){vY=uv.y;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(normalMatrix*normal);vec4 mv=viewMatrix*w;vP=-mv.xyz;gl_Position=projectionMatrix*mv;}';
var beamF='uniform vec3 col;uniform float t;uniform float k;varying vec3 vP;varying vec3 vN;varying vec3 vW;varying float vY;'+
'float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}'+
'float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}'+
'void main(){float fr=pow(abs(dot(normalize(vN),normalize(vP))),2.2);float along=pow(vY,1.6);'+
'float smoke=.55+.45*n(vW*1.4+vec3(0.,-t*.35,t*.2))*n(vW*3.1+vec3(t*.25,0.,0.));'+
'float a=fr*along*smoke*k;gl_FragColor=vec4(col*a,a);}';

function start(){
 if(go)return;go=true;
 try{renderer=new THREE.WebGLRenderer({antialias:!PH,alpha:true,powerPreference:'high-performance'});}catch(e){return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,PH?1:1.5));renderer.setClearColor(0x000000,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 mount.appendChild(renderer.domElement);
 scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x05070d,.035);
 cam=new THREE.PerspectiveCamera(38,1,.1,100);cam.position.set(0,0,10);

 // editorial footage on a screen plane, deep in the stage
 video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.setAttribute('playsinline','');video.crossOrigin='anonymous';
 video.src=B+(PH?'stage-m.mp4':'stage.mp4');video.play().catch(function(){});
 var vt=new THREE.VideoTexture(video);vt.colorSpace=THREE.SRGBColorSpace;
 screen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:vt,color:0xc9ccd6,fog:false}));
 screen.position.z=-6;scene.add(screen);

 // truss and moving heads, real lit geometry
 scene.add(new THREE.HemisphereLight(0x8aa0ff,0x100804,.6));
 var key=new THREE.PointLight(0xffd2a8,25,30);key.position.set(0,6,4);scene.add(key);
 var metal=new THREE.MeshStandardMaterial({color:0x2a2c31,metalness:.9,roughness:.35});
 var truss=new THREE.Group();scene.add(truss);
 var bar=new THREE.Mesh(new THREE.BoxGeometry(30,.18,.18),metal);truss.add(bar);
 var bar2=bar.clone();bar2.position.y=.5;truss.add(bar2);
 for(var d=-14;d<=14;d+=.7){var r=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.72,6),metal);r.position.set(d,.25,0);r.rotation.z=(d*10|0)%2?.6:-.6;truss.add(r)}
 var cols=[0xffb27a,0x9fb8ff,0xffe2c4,0x9fb8ff,0xffb27a],N=PH?2:4;
 for(var i=0;i<N;i++){
  var x=PH?(i?1.5:-1.5):[-7,-3.2,3.2,7][i];
  var head=new THREE.Group();head.position.set(x,-.2,0);truss.add(head);
  var body=new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,.42,20),metal);body.rotation.x=Math.PI/2;
  var lens=new THREE.Mesh(new THREE.CircleGeometry(.2,24),new THREE.MeshBasicMaterial({color:cols[i%5]}));lens.position.z=.28;
  var yoke=new THREE.Group();yoke.add(body);yoke.add(lens);head.add(yoke);
  var len=16,g=new THREE.CylinderGeometry(.16,PH?1.9:2.4,len,40,1,true);g.translate(0,-len/2,0);g.rotateX(-Math.PI/2);
  var m=new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(cols[i%5])},t:{value:0},k:{value:.55}},vertexShader:beamV,fragmentShader:beamF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  // geometry built pointing +z then flipped so uv.y=1 at the lamp
  var beam=new THREE.Mesh(g,m);beam.position.z=.3;yoke.add(beam);
  heads.push({yoke:yoke,lens:lens,mat:m,x:x,ph:i*1.7});
 }

 // haze particles in 3D
 var P=PH?500:1400,pos=new Float32Array(P*3);for(var j=0;j<P;j++){pos[j*3]=(Math.random()-.5)*24;pos[j*3+1]=(Math.random()-.5)*12;pos[j*3+2]=-5+Math.random()*12}
 var hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.BufferAttribute(pos,3));
 haze=new THREE.Points(hg,new THREE.PointsMaterial({color:0xd8dcff,size:PH?.05:.035,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(haze);

 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
 bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.7,.5,.72);composer.addPass(bloom);composer.addPass(new OutputPass());

 size();addEventListener('resize',size);
 if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting},{rootMargin:'100px'}).observe(root);
 video.addEventListener('playing',function(){renderer.domElement.classList.add('on')},{once:true});
 setTimeout(function(){renderer.domElement.classList.add('on')},1500);
 renderer.setAnimationLoop(loop);hints();
}
function size(){
 var r=root.getBoundingClientRect();W=r.width;H=r.height;renderer.setSize(W,H,false);composer.setSize(W,H);
 bloom.resolution.set(W/(PH?3:2),H/(PH?3:2));cam.aspect=W/H;cam.updateProjectionMatrix();
 // cover-fit the screen plane at its depth
 var dist=cam.position.z-screen.position.z,vh=2*dist*Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*1.12,vw=vh*cam.aspect,va=PH?1:16/9;
 if(vw/vh>va)screen.scale.set(vw,vw/va,1);else screen.scale.set(vh*va,vh,1);if(PH){screen.scale.multiplyScalar(1.5);screen.position.y=-vh*.2;screen.position.x=vh*.08}
 var top=Math.tan(THREE.MathUtils.degToRad(cam.fov/2))*cam.position.z;heads.length&&(heads[0].yoke.parent.parent.position.y=top+.15);
}
var last=0;
function loop(now){
 if(!vis)return;if(PH&&now-last<33)return;last=now;
 var t=(now-t0)/1000,r=root.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/Math.max(1,r.height)));
 if(PH)aimT.set(Math.sin(t*.4)*.6,Math.cos(t*.3)*.2);
 aim.lerp(aimT,.06);
 cam.position.x=aim.x*.6;cam.position.y=-aim.y*.3-p*1.2;cam.position.z=10-p*2;cam.lookAt(0,-p*1.2,-6);
 var tgt=new THREE.Vector3();
 for(var i=0;i<heads.length;i++){var h=heads[i];
  var sw=Math.sin(t*.5+h.ph)*1.6+sweep*Math.sin(t*9+h.ph)*5;
  tgt.set(aim.x*7*(i%2?1:.6)+sw+h.x*.25,-6+aim.y*3+Math.cos(t*.37+h.ph)*.8,-3);
  h.yoke.lookAt(h.yoke.localToWorld(new THREE.Vector3()).lerp(tgt,1));
  h.mat.uniforms.t.value=t;h.mat.uniforms.k.value=.8+flash*.9+.08*Math.sin(t*2+h.ph);
 }
 haze.rotation.y=Math.sin(t*.05)*.1;haze.position.x=(t*.15)%2-1;
 bloom.strength=.6+flash*.6;screen.material.color.setScalar(.5+flash*.25);
 composer.render();flash*=.92;sweep*=.95;
}
function tap(e){
 if(e.target.closest('a,button'))return;start();
 var r=root.getBoundingClientRect();aimT.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2);flash=1;sweep=1;
 if(navigator.vibrate)try{navigator.vibrate(10)}catch(_){}
 if(++taps>=4)root.querySelectorAll('.cxd3-hint').forEach(function(h){h.remove()});
}
function hints(){
 var lbl=IT?'tocca':'tap';
 (function one(){if(taps>=4||!document.contains(root))return;
  var h=document.createElement('span');h.className='cxd3-hint';h.innerHTML='<i></i><i></i><b>'+lbl+'</b>';
  h.style.left=55+Math.random()*35+'%';h.style.top=25+Math.random()*40+'%';
  root.appendChild(h);setTimeout(function(){h.remove()},1400);setTimeout(one,1400)})();
}
root.addEventListener('pointerdown',tap);
root.addEventListener('pointermove',function(e){var r=root.getBoundingClientRect();aimT.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2)});
['pointermove','pointerdown','scroll','keydown','touchstart'].forEach(function(t){addEventListener(t,start,{once:true,passive:true})});
addEventListener('load',function(){setTimeout(function(){(window.requestIdleCallback||setTimeout)(start)},1200)});
})();
