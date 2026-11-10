const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
const tabs=[...nav.querySelectorAll('a[href^="#"]')];
const panels=[...document.querySelectorAll('main>section[id]')];
function showPanel(id,updateHash=true){
  const target=panels.find(panel=>panel.id===id);
  if(!target)return;
  panels.forEach(panel=>panel.classList.toggle('active',panel===target));
  tabs.forEach(tab=>{const selected=tab.getAttribute('href')==='#'+id;tab.classList.toggle('active',selected);if(selected)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');});
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
  if(updateHash)history.replaceState(null,'','#'+id);
  window.scrollTo({top:0,behavior:'auto'});
}
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
tabs.forEach(tab=>tab.addEventListener('click',event=>{event.preventDefault();showPanel(tab.getAttribute('href').slice(1));}));
document.querySelectorAll('a[href^="#"]:not(.main-nav a)').forEach(link=>link.addEventListener('click',event=>{const id=link.getAttribute('href').slice(1);if(panels.some(panel=>panel.id===id)){event.preventDefault();showPanel(id);}}));
const initial=location.hash.slice(1);
showPanel(panels.some(panel=>panel.id===initial)?initial:'inicio',false);
document.querySelector('#year').textContent=new Date().getFullYear();
const form=document.querySelector('#register-form');
form.addEventListener('submit',event=>{event.preventDefault();const feedback=document.querySelector('#form-feedback');feedback.textContent='Gracias por tu interés. El registro todavía no está conectado a un sistema de recepción; pronto publicaremos los canales oficiales de contacto.';feedback.classList.add('is-visible');});