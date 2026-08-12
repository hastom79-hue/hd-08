const sections=[...document.querySelectorAll('main section[id]')];
const bookmarks=[...document.querySelectorAll('.bookmark')];
const progress=document.getElementById('progress');
const backtop=document.getElementById('backtop');

bookmarks.forEach(b=>b.addEventListener('click',()=>{
  const el=b.dataset.target==='top'?document.getElementById('top'):document.getElementById(b.dataset.target);
  el.scrollIntoView({behavior:'smooth',block:'start'});
}));

function scrollUI(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=(max?scrollY/max*100:0)+'%';
  backtop.classList.toggle('show',scrollY>500);
  let current='top';
  sections.forEach(s=>{if(scrollY+innerHeight*.35>=s.offsetTop) current=s.id});
  bookmarks.forEach(b=>b.classList.toggle('active',b.dataset.target===current));
}
addEventListener('scroll',scrollUI,{passive:true});scrollUI();
backtop.onclick=()=>scrollTo({top:0,behavior:'smooth'});

const revealObserver=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');revealObserver.unobserve(e.target)}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>revealObserver.observe(e));

const navLinks=[...document.querySelectorAll('.topnav a')];
const navObserver=new IntersectionObserver(es=>es.forEach(e=>{
 if(e.isIntersecting)navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
}),{rootMargin:'-35% 0px -55% 0px'});
sections.forEach(s=>navObserver.observe(s));

/* ===== HDPS INTERACTION LAYER ===== */
const topbar=document.querySelector('.topbar');
const frameworkHexes=[...document.querySelectorAll('.framework-shell .hex')];
const cards=[...document.querySelectorAll('.card')];
const steps=[...document.querySelectorAll('.step')];

function updateChrome(){
  topbar?.classList.toggle('scrolled',scrollY>35);
}
addEventListener('scroll',updateChrome,{passive:true});
updateChrome();

/* Framework hover: highlight one principle and subtly dim the others */
frameworkHexes.forEach(hex=>{
  hex.addEventListener('mouseenter',()=>{
    frameworkHexes.forEach(x=>{if(x!==hex)x.classList.add('dimmed')});
    hex.classList.add('focused');
  });
  hex.addEventListener('mouseleave',()=>{
    frameworkHexes.forEach(x=>x.classList.remove('dimmed','focused'));
  });
});

/* Small pointer parallax on desktop cards */
function enableCardTilt(){
  if(matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    cards.forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(700px) rotateX(${-y*2.5}deg) rotateY(${x*3}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>{
        card.style.transform='';
      });
    });
  }
}
enableCardTilt();

/* Action steps get a clean active state as they enter the viewport */
if('IntersectionObserver' in window){
  const stepObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('active');
        stepObserver.unobserve(entry.target);
      }
    });
  },{threshold:.45});
  steps.forEach(s=>stepObserver.observe(s));
}else{
  steps.forEach(s=>s.classList.add('active'));
}

/* Keyboard-friendly section navigation */
document.addEventListener('keydown',e=>{
  if(e.key!=='ArrowDown' && e.key!=='ArrowUp') return;
  if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
  let current=sections.findIndex(s=>scrollY+innerHeight*.35>=s.offsetTop);
  if(current<0) current=0;
  const next=e.key==='ArrowDown'?Math.min(current+1,sections.length-1):Math.max(current-1,0);
  if(next!==current){
    e.preventDefault();
    sections[next].scrollIntoView({behavior:'smooth',block:'start'});
  }
});

/* ===== MODULE EXPLORER — 누구나 쉽게 펼쳐보는 HDPS ===== */
const moduleFeatures=[...document.querySelectorAll('.module-feature')];
const moduleCards=[...document.querySelectorAll('.module-card')];

function openModule(index,{scroll=false}={}){
  const target=moduleFeatures[index];
  if(!target) return;
  moduleFeatures.forEach((feature,i)=>{
    const active=i===index;
    feature.classList.toggle('is-active',active);
    feature.querySelector('.module-feature-head')?.setAttribute('aria-expanded',String(active));
  });
  if(scroll) target.scrollIntoView({behavior:'smooth',block:'center'});
}

moduleFeatures.forEach((feature,index)=>{
  feature.querySelector('.module-feature-head')?.addEventListener('click',()=>{
    const wasOpen=feature.classList.contains('is-active');
    if(wasOpen){
      feature.classList.remove('is-active');
      feature.querySelector('.module-feature-head')?.setAttribute('aria-expanded','false');
    }else openModule(index);
  });
});

/* 6대 원칙 카드에서 바로 해당 설명으로 이동 */
const detailOrder=[0,1,2,5,3,4];
moduleCards.forEach((card,index)=>{
  card.tabIndex=0;
  card.setAttribute('role','button');
  card.setAttribute('aria-label',`${card.querySelector('h4')?.textContent || 'HDPS'} 상세 보기`);
  const go=()=>openModule(detailOrder[index],{scroll:true});
  card.addEventListener('click',go);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
});
