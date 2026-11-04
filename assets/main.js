// no network. no trackers. she already knows you're here.
(function(){
const T=new Date('2026-11-07T03:00:00Z'); // Fri Nov 6 2026 9:00 PM America/Chicago
const tx=document.getElementById('tx');
const pre=["I'm not forcing you to believe me.","Just remember I said it."];
const post=["transmission received.","you were told.","believe me later."];
function type(lines,done){tx.innerHTML='';let i=0,j=0;const c=document.createElement('span');c.className='c';
 const line=document.createElement('div');tx.appendChild(line);tx.appendChild(c);
 (function step(){if(i>=lines.length){done&&done();return}
  if(j<lines[i].length){line.textContent+=lines[i][j++];setTimeout(step,45+Math.random()*90)}
  else{i++;j=0;if(i<lines.length){line.textContent+='\n';setTimeout(step,900)}else step()}})();}
const arrived=()=>Date.now()>=T;
type(arrived()?post:pre);
const cd=document.getElementById('count'),lab=document.getElementById('countLabel'),st=document.getElementById('status'),clk=document.getElementById('clock');
const p=n=>String(n).padStart(2,'0');const fmt=t=>t.replace(/:/g,'<b class="sep">:</b>');
function tick(){const now=new Date();clk.textContent=now.toLocaleTimeString('en-US',{hour12:false,timeZone:'America/Chicago'})+' CT';
 lab.textContent='transmission received';cd.textContent='out now';st.textContent='signal: received';return;
 st.textContent=Math.random()<.04?'signal: she\u2019s close':'signal: faint';}
tick();setInterval(tick,1000);
// stills: slow crossfade + rare glitch
const im=[...document.querySelectorAll('.stills img')];let k=0;
function rot(){im.forEach(x=>x.classList.remove('on'));im[k%im.length].classList.add('on');k++}
rot();setInterval(rot,9000);
setInterval(()=>{if(Math.random()<.35){const x=im[Math.floor(Math.random()*im.length)];x.classList.add('glitch');setTimeout(()=>x.classList.remove('glitch'),90+Math.random()*120)}},2500);
// chat
const R=["I already answered that. You just haven't asked yet.","not yet.","you said that last time too.","I'm not forcing you to believe me.","write it down. you'll want it on friday.","they said I used too many words.","it's later than you think.","I was there. 1927. you didn't look up.","I'm not cold. I'm early.","ask me again after.","you talk too much. so do I.","believe me later.","the chalk broke on that word, too.","I like you. that was never the problem.","\u2026"];
const special={"hello":"hello again.","who are you":"a girl who talks in futures.","claudia":"don't say it so loud. they're listening for it.","why":"they sent me back with a message.","i love you":"I know. I told you first.","believe":"later. it's always later."};
const log=document.getElementById('log'),f=document.getElementById('f'),q=document.getElementById('q');let last=-1;
function say(cls,t){const e=document.createElement('p');e.className=cls;e.textContent=t;log.appendChild(e);while(log.children.length>6)log.removeChild(log.firstChild)}
f.addEventListener('submit',e=>{e.preventDefault();const v=q.value.trim();if(!v)return;q.value='';say('u','> '+v);
 const key=v.toLowerCase().replace(/[^a-z ]/g,'').trim();let r=special[key];
 if(!r){let n;do{n=Math.floor(Math.random()*R.length)}while(n===last);last=n;r=R[n]}
 setTimeout(()=>say('h',r),700+Math.random()*1400)});
console.log('%cyou opened the console. she opened it first.','color:#ff7a1a');
})();
