const SUPABASE_URL='https://heuxofiaijgpwzvrbvoa.supabase.co';
const SUPABASE_KEY='sb_publishable_3f_pQw9FSMD9ipequee7Ew_w4sIP_iL';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
const tabs=[...nav.querySelectorAll('a[href^="#"]')];
const panels=[...document.querySelectorAll('main>section[id]')];
function showPanel(id,updateHash=true){
 const target=panels.find(panel=>panel.id===id);if(!target)return;
 panels.forEach(panel=>panel.classList.toggle('active',panel===target));
 tabs.forEach(tab=>{const selected=tab.getAttribute('href')==='#'+id;tab.classList.toggle('active',selected);if(selected)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');});
 nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');
 if(updateHash)history.replaceState(null,'','#'+id);window.scrollTo({top:0,behavior:'auto'});
}
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
tabs.forEach(tab=>tab.addEventListener('click',event=>{event.preventDefault();showPanel(tab.getAttribute('href').slice(1));}));
document.querySelectorAll('a[href^="#"]:not(.main-nav a)').forEach(link=>link.addEventListener('click',event=>{const id=link.getAttribute('href').slice(1);if(panels.some(panel=>panel.id===id)){event.preventDefault();showPanel(id);}}));
const initial=location.hash.slice(1);showPanel(panels.some(panel=>panel.id===initial)?initial:'inicio',false);
document.querySelector('#year').textContent=new Date().getFullYear();
const say=(id,message)=>{const el=document.getElementById(id);if(el)el.textContent=message;};
const uploadImage=async(file,folder)=>{
 if(!file)return null;
 const mimeByExt={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
 const extFromName=(file.name||'').split('.').pop().toLowerCase();
 const contentType=['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:mimeByExt[extFromName];
 if(!contentType)throw new Error('Formato no permitido. El archivo debe ser JPG, PNG o WebP. Formato detectado: '+(file.type||extFromName||'desconocido'));
 if(file.size>5*1024*1024)throw new Error('La imagen pesa '+(file.size/1024/1024).toFixed(2)+' MB y el límite actual es 5 MB. Reduce su tamaño e inténtalo otra vez.');
 const ext=contentType==='image/jpeg'?'jpg':contentType.split('/')[1];
 const randomName=(globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const path=folder+'/'+randomName+'.'+ext;
 const {data,error}=await db.storage.from('smial-media').upload(path,file,{contentType,upsert:false,cacheControl:'3600'});
 if(error){
  console.error('Error de carga en Supabase Storage:',{message:error.message,statusCode:error.statusCode,error:error.error,name:error.name,path});
  throw new Error('Supabase Storage rechazó la imagen. '+(error.message||error.error||'Error sin detalle')+(error.statusCode?' (HTTP '+error.statusCode+')':''));
 }
 if(!data?.path)throw new Error('Supabase no confirmó la ruta del archivo. Vuelve a intentarlo.');
 return data.path;
};

const SITE_DEFAULTS={"announcement":"Un hogar para quienes mantienen viva la llama de la Tierra Media","site_title":"SMIAL DOL AMROTH","brand_subtitle":"CHILE · TIERRA MEDIA","hero_eyebrow":"GONDOR · BELFALAS · CHILE","hero_title":"Donde el mar\nencuentra la leyenda.","hero_intro":"Somos el Smial Dol Amroth de Chile: una comunidad que celebra la obra de J. R. R. Tolkien, comparte historias y construye nuevas aventuras en compañía.","hero_caption":"EN LAS COSTAS DE BELFALAS · UNA COMUNIDAD, MUCHAS HISTORIAS","lore_title":"Una historia junto\nal Gran Mar.","lore_intro":"Inspirados por las costas de Gondor y el legado de sus gentes, encontramos en la Tierra Media un lugar para imaginar, aprender y compartir.","events_title":"Las historias\nse viven juntos.","events_intro":"Reuniones, conversaciones, lecturas y actividades para compartir nuestra afición por Tolkien.","members_title":"Rostros e historias\nde nuestra casa.","members_intro":"Cada integrante puede dar vida a un personaje con identidad, historia y lugar dentro del universo narrativo del Smial. Las Medallas de Dol Amroth reconocen la ayuda, la iniciativa, la organización y los aportes que fortalecen nuestra comunidad.","shadow_title":"La Sombra\nse extiende.","shadow_intro":"Desde el Este crece una amenaza. La Sombra de Mordor se cierne sobre nuestras tierras y solo la unión de la comunidad podrá mantenerla a raya.","about_title":"Una casa para\nla imaginación.","about_intro":"El Smial Dol Amroth de Chile es un espacio de encuentro para personas que comparten su interés por el legendarium de J. R. R. Tolkien. Nos reúne la lectura, la conversación, la creatividad y el gusto por construir comunidad.","about_text":"Queremos que este sitio sea la puerta de entrada a nuestras actividades y también el archivo vivo de las historias que vamos creando como grupo.","register_title":"Hay sitio en la mesa\npara una historia más.","register_intro":"¿Te interesa Tolkien, quieres conocer nuestras actividades o formar parte del Smial? Déjanos tus datos y nos pondremos en contacto cuando el registro esté habilitado.","footer_text":"Una comunidad inspirada en la obra de J. R. R. Tolkien.","paper":"#f4f2ed","ink":"#1a2939","heading_color":"#101f35","text_color":"#1a2939","muted_color":"#687582","border_color":"#c8d2dc","navy":"#101f35","blue":"#24486b","gold":"#b9a477","serif":"Cinzel","sans":"Manrope","hero_image_path":"","logo_image_path":""};
let siteSettings={...SITE_DEFAULTS};
const settingFields=[...document.querySelectorAll('#site-settings-form [data-setting]')];
function settingImageUrl(path){return path?db.storage.from('smial-media').getPublicUrl(path).data.publicUrl:'';}
function applySiteSettings(){
 const s={...SITE_DEFAULTS,...siteSettings};
 const root=document.documentElement;
 ['paper','navy','blue','gold'].forEach(k=>root.style.setProperty('--'+k,s[k]||SITE_DEFAULTS[k]));
 root.style.setProperty('--ink','#1a2939');
 root.style.setProperty('--heading-color','#101f35');
 root.style.setProperty('--text-color','#1a2939');
 root.style.setProperty('--muted-color','#687582');
 root.style.setProperty('--border-color',s.border_color||'#c8d2dc');
 root.style.setProperty('--navy2',s.navy||SITE_DEFAULTS.navy);
 const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=s.navy||SITE_DEFAULTS.navy;
 
 const text=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value||'';};
 const title=(id,value)=>{const el=document.getElementById(id);if(el)el.innerHTML=escapeHtml(value||'').replace(/\n/g,'<br>');};
 text('announcement-copy',s.announcement);text('brand-site-title',s.site_title);text('brand-site-subtitle',s.brand_subtitle);
 text('hero-eyebrow',s.hero_eyebrow);title('hero-title',s.hero_title);text('hero-intro',s.hero_intro);text('hero-caption',s.hero_caption);
 title('lore-title',s.lore_title);text('lore-intro',s.lore_intro);title('events-title',s.events_title);text('events-intro',s.events_intro);
 title('members-title',s.members_title);text('members-intro',s.members_intro);title('shadow-title',s.shadow_title);text('shadow-intro',s.shadow_intro);
 title('about-title',s.about_title);text('about-intro',s.about_intro);text('about-text',s.about_text);
 title('register-title',s.register_title);text('register-intro',s.register_intro);text('footer-text',s.footer_text);
 document.title=(s.site_title||'SMIAL DOL AMROTH')+' | Chile';
 const hero=s.hero_image_path?settingImageUrl(s.hero_image_path):'';
 if(hero)root.style.setProperty('--hero-image','url("'+hero.replace(/"/g,'%22')+'")');else root.style.removeProperty('--hero-image');
 const logo=document.getElementById('brand-logo-image'),mark=document.querySelector('.brand-mark'),svg=mark?.querySelector('svg'),aboutLogo=document.getElementById('about-logo-image'),aboutMark=document.querySelector('.about-emblem'),aboutSvg=aboutMark?.querySelector('svg');
 if(s.logo_image_path){const logoUrl=settingImageUrl(s.logo_image_path);logo.src=logoUrl;logo.hidden=false;mark?.classList.add('has-custom-logo');if(svg)svg.hidden=true;aboutLogo.src=logoUrl;aboutLogo.hidden=false;aboutMark?.classList.add('has-custom-logo');if(aboutSvg)aboutSvg.hidden=true;}else{logo.removeAttribute('src');logo.hidden=true;mark?.classList.remove('has-custom-logo');if(svg)svg.hidden=false;aboutLogo.removeAttribute('src');aboutLogo.hidden=true;aboutMark?.classList.remove('has-custom-logo');if(aboutSvg)aboutSvg.hidden=false;}
}
function fillSiteSettingsForm(){
 settingFields.forEach(el=>{const key=el.dataset.setting;el.value=siteSettings[key]??SITE_DEFAULTS[key]??'';});
 ['hero','logo'].forEach(kind=>{const key=kind==='hero'?'hero_image_path':'logo_image_path',host=document.getElementById('site-'+kind+'-preview'),url=settingImageUrl(siteSettings[key]);host.innerHTML=url?'<img src="'+escapeHtml(url)+'" alt="Imagen actual">':(siteSettings[key]?'Imagen configurada':'Sin imagen personalizada');});
}
async function loadSiteSettings(){
 const {data,error}=await db.from('site_settings').select('settings').eq('id',1).maybeSingle();
 if(!error&&data?.settings)siteSettings={...SITE_DEFAULTS,...data.settings};
 applySiteSettings();
}
async function loadSiteSettingsAdmin(){
 const {data,error}=await db.from('site_settings').select('settings').eq('id',1).maybeSingle();
 if(error){say('site-settings-feedback','No se pudo cargar la configuración: '+error.message);return;}
 siteSettings={...SITE_DEFAULTS,...(data?.settings||{})};fillSiteSettingsForm();applySiteSettings();
}
settingFields.forEach(el=>el.addEventListener('input',()=>{siteSettings[el.dataset.setting]=el.value;applySiteSettings();}));
document.querySelectorAll('[data-site-image]').forEach(input=>input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 const label=input.dataset.siteImage==='logo_image_path'?'emblema del encabezado':'imagen de portada';
 say('site-settings-feedback','Subiendo '+label+' ('+(file.size/1024/1024).toFixed(2)+' MB)...');
 input.disabled=true;
 try{
  const path=await uploadImage(file,'site');
  siteSettings[input.dataset.siteImage]=path;
  fillSiteSettingsForm();applySiteSettings();
  say('site-settings-feedback','Imagen subida correctamente. Pulsa «Guardar cambios» para publicarla.');
 }catch(err){
  console.error('No se pudo subir '+label+':',err);
  say('site-settings-feedback','ERROR AL SUBIR '+label.toUpperCase()+': '+(err.message||String(err)));
 }finally{input.disabled=false;}
}));
document.getElementById('site-settings-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const {data:{session}}=await db.auth.getSession();
  const {error}=await db.from('site_settings').upsert({id:1,settings:siteSettings,updated_at:new Date().toISOString(),updated_by:session?.user?.id||null},{onConflict:'id'});
  if(error)throw error;
  say('site-settings-feedback','Cambios publicados correctamente.');applySiteSettings();
 }catch(err){say('site-settings-feedback','No se pudieron guardar los cambios: '+(err.message||'Error desconocido'));}
 finally{button.disabled=false;}
});
document.getElementById('site-settings-reset').addEventListener('click',async()=>{
 if(!confirm('¿Restaurar todos los textos, colores, tipografías e imágenes originales?'))return;
 siteSettings={...SITE_DEFAULTS};fillSiteSettingsForm();applySiteSettings();
 const {data:{session}}=await db.auth.getSession();
 const {error}=await db.from('site_settings').upsert({id:1,settings:siteSettings,updated_at:new Date().toISOString(),updated_by:session?.user?.id||null},{onConflict:'id'});
 say('site-settings-feedback',error?'No se pudo restaurar: '+error.message:'Diseño original restaurado.');
});

const charForm=document.getElementById('character-form');
const story=document.getElementById('character-story');
story.addEventListener('input',()=>say('story-count',story.value.length+'/1000'));
charForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=charForm.querySelector('button');button.disabled=true;say('character-feedback','Enviando solicitud...');
 try{
  const file=document.getElementById('character-image').files[0];
  if(!file)throw new Error('Selecciona una imagen.');
  const bitmap=await createImageBitmap(file);
  if(bitmap.width!==512||bitmap.height!==512)throw new Error('La imagen debe medir exactamente 512 × 512 píxeles.');
  const image_path=await uploadImage(file,'characters');
  const payload={real_name:document.getElementById('real-name').value.trim(),tolkien_name:document.getElementById('tolkien-name').value.trim(),role_title:document.getElementById('character-role').value.trim(),story:story.value.trim(),image_path,status:'pending'};
  const {error}=await db.from('characters').insert(payload);if(error)throw error;
  charForm.reset();say('story-count','0/1000');say('character-feedback','Solicitud enviada. Quedará pendiente hasta que un administrador la revise.');
 }catch(err){say('character-feedback',err.message||'No se pudo enviar la solicitud.');}finally{button.disabled=false;}
});
async function loadApproved(){
 const host=document.getElementById('approved-members');if(!host)return;
 const {data,error}=await db.from('characters').select('id,real_name,tolkien_name,role_title,story,achievements,image_path,hope_level,shadow_level').eq('status','approved').order('reviewed_at',{ascending:false});
 if(error){host.textContent='No fue posible cargar los personajes.';return;}
 const ids=(data||[]).map(c=>c.id);let awards=[];
 if(ids.length){const result=await db.from('character_medals').select('character_id,medal_id').in('character_id',ids);awards=result.data||[];}
 const medalIds=[...new Set(awards.map(a=>a.medal_id))];let catalog=[];
 if(medalIds.length){const result=await db.from('medal_catalog').select('id,name,icon').in('id',medalIds);catalog=result.data||[];}
 const medalMap=new Map(catalog.map(m=>[m.id,m]));const grouped=new Map();
 awards.forEach(a=>{const medal=medalMap.get(a.medal_id);if(medal){if(!grouped.has(a.character_id))grouped.set(a.character_id,[]);grouped.get(a.character_id).push(medal);}});
 host.innerHTML=data.map(c=>{
  const image=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;
  const badges=(grouped.get(c.id)||[]).map(m=>'<span class="medal-badge" title="'+escapeHtml(m.name)+'"><b>'+escapeHtml(m.icon)+'</b> '+escapeHtml(m.name)+'</span>').join('');
  return '<article class="approved-card"><img src="'+image+'" alt=""><div><h3>'+escapeHtml(c.tolkien_name)+'</h3><p class="card-kicker">'+escapeHtml(c.role_title)+' · '+escapeHtml(c.real_name)+'</p><div class="character-levels"><span>Esperanza <b>'+c.hope_level+'/10</b></span><span>Sombra <b>'+c.shadow_level+'/10</b></span></div>'+(c.hope_level<3?'<p class="consumed-label">CONSUMIDO · ANTAGONISTA</p>':'')+'<p>'+escapeHtml(c.story)+'</p>'+(c.achievements?'<p><strong>Logros:</strong> '+escapeHtml(c.achievements)+'</p>':'')+(badges?'<div class="medal-collection"><strong>Medallas de Dol Amroth</strong><div>'+badges+'</div></div>':'')+'</div></article>';
 }).join('')||'<div class="members-empty"><div class="empty-crest">✧</div><h3>Las primeras historias están por llegar</h3><p>Los personajes aparecerán aquí una vez aprobados.</p></div>';
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
async function loadLoreChronicle(){
 const host=document.getElementById('lore-chronicle');if(!host)return;
 const {data,error}=await db.from('lore_chronicle').select('*').order('sort_order',{ascending:true});
 if(error){host.textContent='No fue posible cargar el lore oficial.';return;}
 host.innerHTML=(data||[]).map(entry=>{const cover=entry.cover_image_path?db.storage.from('smial-media').getPublicUrl(entry.cover_image_path).data.publicUrl:'';return '<article class="lore-chapter"><p class="card-kicker">'+(entry.entry_type==='event'?'CRÓNICA RESUELTA':'LORE DEL SMIAL')+'</p><h3>'+escapeHtml(entry.title)+'</h3>'+(cover?'<img class="lore-chapter-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(entry.content)+'</div></article>';}).join('')||'<p class="small-note">La historia oficial del Smial aún no ha sido publicada.</p>';
}
async function loadEvents(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').order('event_date',{ascending:true});
 if(error)return;
 host.innerHTML=data.map(ev=>{const cover=ev.lore_cover_image_path?db.storage.from('smial-media').getPublicUrl(ev.lore_cover_image_path).data.publicUrl:'';return '<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3><p>'+escapeHtml(ev.description)+'</p><small>'+escapeHtml(ev.location)+'</small>'+(ev.lore_title?'<div class="event-lore"><span>CRÓNICA DEL SMIAL</span><h4>'+escapeHtml(ev.lore_title)+'</h4>'+(cover?'<img class="event-lore-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(ev.lore_intro||'')+'</div>'+(ev.lore_resolution?'<div class="event-resolution"><b>'+escapeHtml((ev.lore_outcome||'').toUpperCase())+'</b><div class="event-lore-content">'+sanitizeRich(ev.lore_resolution)+'</div></div>':'<small>El desenlace se conocerá al cerrar el evento.</small>')+'</div>':'')+'</article>';}).join('');
}
async function loadLoreScenarios(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').order('event_date',{ascending:true});
 if(error)return;
 host.innerHTML=data.map(ev=>'<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3><p>'+escapeHtml(ev.description)+'</p><small>'+escapeHtml(ev.location)+'</small>'+(ev.lore_title?'<div class="event-lore"><span>CRÓNICA DEL SMIAL</span><h4>'+escapeHtml(ev.lore_title)+'</h4><p>'+escapeHtml(ev.lore_intro||'')+'</p>'+(ev.lore_resolution?'<div class="event-resolution"><b>'+escapeHtml((ev.lore_outcome||'').toUpperCase())+'</b><p>'+escapeHtml(ev.lore_resolution)+'</p></div>':'<small>El desenlace se conocerá al cerrar el evento.</small>')+'</div>':'')+'</article>').join('');
}
async function loadLoreScenarios(){
 const select=document.getElementById('event-lore-scenario');if(!select)return;
 const {data,error}=await db.from('lore_scenarios').select('id,name').eq('active',true).order('sort_order').order('name');
 if(error){select.innerHTML='<option value="">No se pudieron cargar las historias</option>';return;}
 select.innerHTML='<option value="">Selecciona un acontecimiento</option>'+(data||[]).map(s=>'<option value="'+s.id+'">'+escapeHtml(s.name)+'</option>').join('');
}
const loginForm=document.getElementById('login-form');
async function refreshAdmin(){
 const {data:{session}}=await db.auth.getSession();
 const authBox=document.getElementById('auth-box'),dashboard=document.getElementById('admin-dashboard');
 if(!session){authBox.hidden=false;dashboard.hidden=true;return;}
 const role=session.user.app_metadata?.role;
 if(role!=='admin'){authBox.hidden=false;dashboard.hidden=true;say('auth-feedback','La sesión está iniciada, pero este correo aún no tiene permisos de administrador. Contacta al responsable del proyecto.');return;}
 authBox.hidden=true;dashboard.hidden=false;say('admin-identity','Sesión: '+session.user.email);
 await Promise.all([loadPending(),loadAdminAchievements(),loadAdminEvents(),loadLoreAdmin(),loadMedalAdmin(),loadLoreChronicleAdmin(),loadSiteSettingsAdmin()]);
}
loginForm.addEventListener('submit',async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:document.getElementById('admin-email').value.trim(),password:document.getElementById('admin-password').value});say('auth-feedback',error?error.message:'Sesión iniciada.');if(!error)await refreshAdmin();});
document.getElementById('signup-button').addEventListener('click',async()=>{
 const email=document.getElementById('admin-email').value.trim(),password=document.getElementById('admin-password').value;
 if(email.toLowerCase()!=='ch.munozfu@gmail.com'){say('auth-feedback','La creación inicial está limitada al correo administrador indicado.');return;}
 if(password.length<8){say('auth-feedback','Usa una contraseña de al menos 8 caracteres.');return;}
 const {error}=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname+'#admin'}});
 say('auth-feedback',error?error.message:'Cuenta creada. Revisa tu correo para confirmar la dirección y luego inicia sesión. El administrador debe recibir el rol admin antes de usar el panel.');
});
db.auth.onAuthStateChange(()=>{setTimeout(refreshAdmin,0);});
document.getElementById('logout-button').addEventListener('click',async()=>{await db.auth.signOut();await refreshAdmin();});
async function loadPending(){
 const host=document.getElementById('pending-characters');const {data,error}=await db.from('characters').select('*').eq('status','pending').order('submitted_at');
 if(error){host.textContent='Error cargando solicitudes: '+error.message;return;}
 host.innerHTML=data.map(c=>{const image=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;return '<article class="admin-item"><img src="'+image+'" alt=""><div><h4>'+escapeHtml(c.tolkien_name)+' — '+escapeHtml(c.real_name)+'</h4><p><b>'+escapeHtml(c.role_title)+'</b></p><p>'+escapeHtml(c.story)+'</p><p class="admin-hint">Los logros se asignan desde el panel de personajes aprobados.</p><button data-review="approved" data-id="'+c.id+'" class="button button-dark">Aprobar</button> <button data-review="rejected" data-id="'+c.id+'" class="button button-outline-dark">Rechazar</button></div></article>';}).join('')||'<p>No hay solicitudes pendientes.</p>';
 host.querySelectorAll('[data-review]').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;const {error}=await db.from('characters').update({status:button.dataset.review,reviewed_at:new Date().toISOString()}).eq('id',button.dataset.id);if(error)alert(error.message);await loadPending();await loadApproved();await loadAdminAchievements();}));
}

async function loadAdminAchievements(){
 const host=document.getElementById('admin-character-achievements');if(!host)return;
 const {data,error}=await db.from('characters').select('id,tolkien_name,real_name,role_title,achievements,hope_level,shadow_level').eq('status','approved').order('tolkien_name');
 if(error){host.textContent='No se pudieron cargar los personajes: '+error.message;return;}
 host.innerHTML=(data||[]).map(c=>'<article class="admin-achievement-row"><div class="admin-achievement-heading"><strong>'+escapeHtml(c.tolkien_name)+'</strong><small>'+escapeHtml(c.real_name)+' · '+escapeHtml(c.role_title)+'</small><small>Esperanza '+c.hope_level+'/10 · Sombra '+c.shadow_level+'/10</small></div><label for="achievement-'+c.id+'">Logros reconocidos por la administración</label><textarea id="achievement-'+c.id+'" rows="3" maxlength="2000" data-achievements-id="'+c.id+'">'+escapeHtml(c.achievements||'')+'</textarea><button class="button button-dark" type="button" data-save-achievements="'+c.id+'">Guardar logros</button></article>').join('')||'<p>Aún no hay personajes aprobados.</p>';
 host.querySelectorAll('[data-save-achievements]').forEach(button=>button.addEventListener('click',async()=>{
  const id=button.dataset.saveAchievements,field=host.querySelector('[data-achievements-id="'+id+'"]');
  button.disabled=true;const {error}=await db.from('characters').update({achievements:field.value.trim()}).eq('id',id).eq('status','approved');
  if(error)alert('No se pudieron guardar los logros: '+error.message);
  else{button.textContent='Guardado';await loadApproved();}
  button.disabled=false;
 }));
}

const eventForm=document.getElementById('event-form');
eventForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=eventForm.querySelector('button[type="submit"]');button.disabled=true;say('event-feedback','Preparando evento y crónica...');
 try{
  const {data:pending}=await db.from('events').select('id').eq('status','published').eq('attendance_closed',false).not('lore_scenario_id','is',null).limit(1);
  if(pending?.length)throw new Error('Ya existe un acontecimiento activo en La Sombra. Resuélvelo antes de publicar otro.');
  const selectedId=document.getElementById('event-lore-scenario').value;
  if(!selectedId)throw new Error('Selecciona el acontecimiento que vas a activar.');
  const file=document.getElementById('event-image').files[0];const image_path=file?await uploadImage(file,'events'):null;
  const {data:scenarios,error:scenarioError}=await db.from('lore_scenarios').select('*').eq('active',true);
  if(scenarioError)throw scenarioError;
  if(!scenarios?.length)throw new Error('No hay acontecimientos preconfigurados activos.');
  const scenario=scenarios.find(s=>s.id===selectedId);
  if(!scenario)throw new Error('No se pudo seleccionar una historia.');
  const payload={title:document.getElementById('event-title').value.trim(),description:document.getElementById('event-description').value.trim(),event_date:document.getElementById('event-date').value,event_time:document.getElementById('event-time').value||null,location:document.getElementById('event-location').value.trim(),image_path,status:'published',lore_scenario_id:scenario.id,lore_title:scenario.name,lore_cover_image_path:scenario.cover_image_path||null,lore_intro:scenario.intro,lore_low_resolution:scenario.low_resolution,lore_partial_resolution:scenario.partial_resolution,lore_success_resolution:scenario.success_resolution,lore_partial_threshold:scenario.partial_threshold,lore_success_threshold:scenario.success_threshold};
  const {error}=await db.from('events').insert(payload);if(error)throw error;
  eventForm.reset();say('event-feedback','Evento publicado con la crónica: '+scenario.name+'.');await Promise.all([loadAdminEvents(),loadEvents()]);
 }catch(err){say('event-feedback',err.message||'No se pudo publicar.');}finally{button.disabled=false;}
});
async function loadAdminEvents(){
 const host=document.getElementById('admin-events');const {data,error}=await db.from('events').select('*').order('event_date',{ascending:false});
 if(error){host.textContent=error.message;return;}
 host.innerHTML=data.map(ev=>'<article class="admin-event"><div><strong>'+escapeHtml(ev.title)+'</strong><small>'+escapeHtml(ev.event_date)+' · '+escapeHtml(ev.location)+' · '+escapeHtml(ev.status)+(ev.attendance_closed?' · asistencia cerrada':'')+(ev.lore_outcome?' · crónica: '+escapeHtml(ev.lore_outcome):'')+'</small>'+(ev.lore_title?'<small>Historia: '+escapeHtml(ev.lore_title)+(ev.lore_score!==null?' · puntuación '+ev.lore_score:'')+'</small>':'')+'</div><div class="admin-event-actions">'+(ev.status==='published'&&!ev.attendance_closed?'<button class="button button-outline-dark" data-attendance-event="'+ev.id+'">Asistencia y medallas</button>':'')+'<button class="button button-outline-dark" data-delete-event="'+ev.id+'">Eliminar</button></div></article>').join('')||'<p>No hay eventos.</p>';
 host.querySelectorAll('[data-attendance-event]').forEach(button=>button.addEventListener('click',()=>openAttendance(button.dataset.attendanceEvent)));
 host.querySelectorAll('[data-delete-event]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('¿Eliminar este evento?'))return;const {error}=await db.from('events').delete().eq('id',button.dataset.deleteEvent);if(error)alert(error.message);await loadAdminEvents();await loadEvents();}));
}
async function openAttendance(eventId){
 const host=document.getElementById('attendance-manager');host.textContent='Cargando personajes y medallas...';
 const [{data:characters,error:charError},{data:existing,error:attendanceError},{data:eventRow}] = await Promise.all([
  db.from('characters').select('id,tolkien_name,role_title,hope_level,shadow_level').eq('status','approved').order('tolkien_name'),
  db.from('event_attendance').select('character_id,attended').eq('event_id',eventId),
  db.from('events').select('title,attendance_closed,lore_title').eq('id',eventId).single()
 ]);
 if(charError||attendanceError||!eventRow){host.textContent=(charError||attendanceError)?.message||'No se pudo cargar el evento.';return;}
 if(eventRow.attendance_closed){host.textContent='La asistencia de este evento ya fue cerrada.';return;}
 const present=new Set((existing||[]).filter(row=>row.attended).map(row=>row.character_id));
 host.innerHTML='<h4>'+escapeHtml(eventRow.title)+'</h4><p>Marca quién asistió. Los demás personajes aprobados se registrarán como ausentes al cerrar. Después puedes reconocer aportes con medallas.</p><form id="attendance-form"><div class="attendance-list">'+characters.map(c=>'<label><input type="checkbox" name="attended" value="'+c.id+'" '+(present.has(c.id)?'checked':'')+'><span><strong>'+escapeHtml(c.tolkien_name)+'</strong><small>'+escapeHtml(c.role_title)+(c.hope_level<3?' · CONSUMIDO':'')+'</small></span></label>').join('')+'</div><button class="button button-dark" type="submit">Guardar asistencia</button> <button class="button button-outline-dark" id="close-attendance" type="button">Cerrar evento y resolver crónica</button><p id="attendance-feedback" class="form-feedback" role="status"></p></form><div id="event-medal-manager" class="event-medal-manager"><h4>Medallas de Dol Amroth</h4><p>Reconoce a quienes ayudaron, organizaron, aportaron recursos o enriquecieron la actividad. Cada medalla otorgada suma un punto al resultado de la crónica.</p><div id="event-medal-awards"></div><form id="event-medal-form" class="medal-award-form"><label for="medal-character">Miembro</label><select id="medal-character" required>'+characters.map(c=>'<option value="'+c.id+'">'+escapeHtml(c.tolkien_name)+'</option>').join('')+'</select><label for="medal-type">Medalla</label><select id="medal-type" required></select><label for="medal-reason">Motivo del reconocimiento</label><input id="medal-reason" maxlength="300" placeholder="Ej. Ayudó a preparar el lugar y recibir a los asistentes" required><button class="button button-dark" type="submit">Otorgar medalla</button><p id="medal-feedback" class="form-feedback" role="status"></p></form></div>';
 const form=document.getElementById('attendance-form');
 form.addEventListener('submit',async e=>{e.preventDefault();const ids=[...form.querySelectorAll('input[name="attended"]:checked')].map(input=>input.value);const rows=characters.map(c=>({event_id:eventId,character_id:c.id,attended:ids.includes(c.id)}));const {error}=await db.from('event_attendance').upsert(rows,{onConflict:'event_id,character_id'});say('attendance-feedback',error?'Error: '+error.message:'Asistencia guardada. Todavía puedes modificarla antes de cerrar el evento.');});
 document.getElementById('close-attendance').addEventListener('click',async()=>{
  if(!confirm('Al cerrar el evento se aplicarán los cambios de Esperanza y Sombra y se resolverá la crónica según asistentes y medallas. Esta operación no se puede deshacer. ¿Continuar?'))return;
  const ids=[...form.querySelectorAll('input[name="attended"]:checked')].map(input=>input.value);
  const rows=characters.map(c=>({event_id:eventId,character_id:c.id,attended:ids.includes(c.id)}));
  const {error:saveError}=await db.from('event_attendance').upsert(rows,{onConflict:'event_id,character_id'});
  if(saveError){say('attendance-feedback','Error guardando asistencia: '+saveError.message);return;}
  const {error:closeError}=await db.from('events').update({attendance_closed:true}).eq('id',eventId);
  if(closeError){say('attendance-feedback','Error cerrando evento: '+closeError.message);return;}
  const {data:closedEvent}=await db.from('events').select('lore_outcome,lore_resolution,lore_score').eq('id',eventId).single();
  host.innerHTML='<h4>Acontecimiento resuelto</h4><p>Se actualizaron los valores de Esperanza y Sombra. El desenlace quedó incorporado automáticamente al lore oficial.</p>'+(closedEvent?.lore_resolution?'<div class="event-resolution admin-resolution"><b>'+(closedEvent.lore_outcome==='esperanza'?'VICTORIA DE LA ESPERANZA':'VICTORIA DE LA SOMBRA')+' · '+closedEvent.lore_score+' PUNTOS</b><div class="event-lore-content">'+sanitizeRich(closedEvent.lore_resolution)+'</div></div>':'<p>No había un desenlace narrativo asociado.</p>');
  await Promise.all([loadAdminEvents(),loadApproved(),loadShadowState(),loadEvents(),loadLoreChronicle()]);
 });
 await loadEventMedalManager(eventId,characters);
}
async function loadEventMedalManager(eventId,characters){
 const [{data:catalog,error:catalogError},{data:awards,error:awardsError}]=await Promise.all([
  db.from('medal_catalog').select('id,name,description,icon,active').order('sort_order'),
  db.from('character_medals').select('id,character_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at')
 ]);
 const type=document.getElementById('medal-type'),list=document.getElementById('event-medal-awards');
 if(catalogError||awardsError){list.textContent=(catalogError||awardsError).message;return;}
 type.innerHTML=(catalog||[]).filter(m=>m.active).map(m=>'<option value="'+m.id+'">'+escapeHtml(m.icon)+' '+escapeHtml(m.name)+' — '+escapeHtml(m.description)+'</option>').join('');
 const members=new Map(characters.map(c=>[c.id,c.tolkien_name]));const medals=new Map(catalog.map(m=>[m.id,m]));
 const renderAwards=()=>{
  const rows=awards||[];
  list.innerHTML=rows.length?'<p class="medal-award-count">Reconocimientos otorgados en este evento: '+rows.length+'</p>'+rows.map(a=>{const m=medals.get(a.medal_id);return '<div class="medal-award-row"><span>'+escapeHtml(m?.icon||'✦')+' <b>'+escapeHtml(m?.name||'Medalla')+'</b> · '+escapeHtml(members.get(a.character_id)||'Miembro')+'<small>'+escapeHtml(a.reason)+'</small></span><button type="button" class="button button-outline-dark" data-remove-medal="'+a.id+'">Retirar</button></div>';}).join(''):'<p class="medal-award-count">Todavía no se han otorgado medallas para este evento.</p>';
  list.querySelectorAll('[data-remove-medal]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('¿Retirar esta medalla?'))return;const {error}=await db.from('character_medals').delete().eq('id',button.dataset.removeMedal);if(error){say('medal-feedback',error.message);return;}const refreshed=await db.from('character_medals').select('id,character_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at');awards.splice(0,awards.length,...(refreshed.data||[]));renderAwards();}));
 };
 renderAwards();
 document.getElementById('event-medal-form').addEventListener('submit',async e=>{
  e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;
  const {data:{session}}=await db.auth.getSession();
  const payload={character_id:document.getElementById('medal-character').value,medal_id:type.value,event_id:eventId,reason:document.getElementById('medal-reason').value.trim(),awarded_by:session?.user?.id||null};
  const {error}=await db.from('character_medals').insert(payload);
  if(error)say('medal-feedback',error.code==='23505'?'Este miembro ya recibió esa medalla en este evento.':error.message);
  else{say('medal-feedback','Medalla otorgada.');document.getElementById('medal-reason').value='';const refreshed=await db.from('character_medals').select('id,character_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at');awards.splice(0,awards.length,...(refreshed.data||[]));renderAwards();await loadApproved();}
  button.disabled=false;
 });
}

function sanitizeRich(value=''){
 const config={ALLOWED_TAGS:['p','br','strong','b','em','i','u','h2','h3','h4','ul','ol','li','blockquote','img','a'],ALLOWED_ATTR:['href','src','alt','title','target','rel'],ALLOW_DATA_ATTR:false};
 if(window.DOMPurify)return window.DOMPurify.sanitize(String(value),config);
 return escapeHtml(value).replace(/\n/g,'<br>');
}
function richEditorValue(value=''){
 const text=String(value||'');
 return /<\/?[a-z][\s\S]*>/i.test(text)?sanitizeRich(text):text?'<p>'+escapeHtml(text).replace(/\n/g,'<br>')+'</p>':'';
}
function initRichEditors(){
 document.querySelectorAll('[data-editor-command]').forEach(button=>{
  button.addEventListener('mousedown',e=>e.preventDefault());
  button.addEventListener('click',()=>{
   const editor=document.getElementById(button.dataset.editorTarget);if(!editor)return;
   editor.focus();const command=button.dataset.editorCommand;
   const value=button.dataset.editorValue;
   document.execCommand(command,false,value?(command==='formatBlock'?'<'+value+'>':value):null);
  });
 });
 document.querySelectorAll('[data-editor-image]').forEach(input=>{
  input.addEventListener('change',async()=>{
   const file=input.files?.[0];if(!file)return;
   const editor=document.getElementById(input.dataset.editorImage);if(!editor)return;
   input.disabled=true;
   try{
    const path=await uploadImage(file,'lore');
    const url=db.storage.from('smial-media').getPublicUrl(path).data.publicUrl;
    editor.focus();document.execCommand('insertHTML',false,'<p><img src="'+escapeHtml(url)+'" alt="'+escapeHtml(file.name)+'"></p>');
   }catch(err){alert(err.message||'No se pudo subir la imagen.');}
   finally{input.disabled=false;input.value='';}
  });
 });
}
function resetLoreEditor(){
 const form=document.getElementById('lore-scenario-form');form.reset();
 document.getElementById('lore-scenario-id').value='';
 document.getElementById('lore-editor-heading').textContent='Crear una historia';
 document.getElementById('lore-cover-existing').value='';
 document.getElementById('lore-cover-preview').innerHTML='';
 ['lore-intro-editor','lore-low-editor','lore-success-editor'].forEach(id=>document.getElementById(id).innerHTML='');
 document.getElementById('lore-scenario-active').checked=true;

 say('lore-editor-feedback','');
}
async function loadLoreAdmin(){
 const host=document.getElementById('lore-scenario-list');if(!host)return;
 const {data,error}=await db.from('lore_scenarios').select('*').order('sort_order').order('name');
 if(error){host.textContent=error.message;return;}
 host.innerHTML=(data||[]).map(s=>'<div class="library-row"><span><b>'+escapeHtml(s.name)+'</b><small>'+((s.active)?'ACTIVA':'INACTIVA')+' · dos finales · 5 puntos para Esperanza</small></span><span class="library-row-actions"><button type="button" class="button button-outline-dark" data-edit-lore="'+s.id+'">Editar</button><button type="button" class="button button-outline-dark" data-toggle-lore="'+s.id+'" data-active="'+s.active+'">'+(s.active?'Desactivar':'Activar')+'</button></span></div>').join('')||'<p>No hay historias creadas.</p>';
 host.querySelectorAll('[data-edit-lore]').forEach(button=>button.addEventListener('click',()=>editLoreScenario(data.find(s=>s.id===button.dataset.editLore))));
 host.querySelectorAll('[data-toggle-lore]').forEach(button=>button.addEventListener('click',async()=>{
  const active=button.dataset.active!=='true';const {error}=await db.from('lore_scenarios').update({active,updated_at:new Date().toISOString()}).eq('id',button.dataset.toggleLore);
  if(error){say('lore-editor-feedback',error.message);return;}await Promise.all([loadLoreAdmin(),loadLoreScenarios()]);
 }));
}
function editLoreScenario(s){
 if(!s)return;
 document.getElementById('lore-scenario-id').value=s.id;
 document.getElementById('lore-scenario-name').value=s.name;
 document.getElementById('lore-scenario-active').checked=s.active;
 document.getElementById('lore-cover-existing').value=s.cover_image_path||'';
 const cover=s.cover_image_path?db.storage.from('smial-media').getPublicUrl(s.cover_image_path).data.publicUrl:'';
 document.getElementById('lore-cover-preview').innerHTML=cover?'<img src="'+escapeHtml(cover)+'" alt="Imagen principal actual">':'';
 document.getElementById('lore-intro-editor').innerHTML=richEditorValue(s.intro);
 document.getElementById('lore-low-editor').innerHTML=richEditorValue(s.low_resolution);

 document.getElementById('lore-success-editor').innerHTML=richEditorValue(s.success_resolution);

 document.getElementById('lore-editor-heading').textContent='Editar historia';
 say('lore-editor-feedback','Editando: '+s.name);
 document.getElementById('lore-scenario-form').scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('lore-scenario-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
 try{

  const editors=['lore-intro-editor','lore-low-editor','lore-success-editor'];
  const content=editors.map(id=>sanitizeRich(document.getElementById(id).innerHTML));
  if(content.some(value=>!value.trim()))throw new Error('Completa la introducción y los dos finales.');
  let cover=document.getElementById('lore-cover-existing').value||null;
  const file=document.getElementById('lore-cover-image').files[0];if(file)cover=await uploadImage(file,'lore-covers');
  const id=document.getElementById('lore-scenario-id').value;
  const payload={name:document.getElementById('lore-scenario-name').value.trim(),active:document.getElementById('lore-scenario-active').checked,intro:content[0],low_resolution:content[1],partial_resolution:content[2],success_resolution:content[2],partial_threshold:0,success_threshold:5,cover_image_path:cover,updated_at:new Date().toISOString()};
  const result=id?await db.from('lore_scenarios').update(payload).eq('id',id):await db.from('lore_scenarios').insert(payload);
  if(result.error)throw result.error;
  say('lore-editor-feedback',id?'Historia actualizada.':'Historia creada.');
  resetLoreEditor();await Promise.all([loadLoreAdmin(),loadLoreScenarios()]);
 }catch(err){say('lore-editor-feedback',err.message||'No se pudo guardar la historia.');}
 finally{button.disabled=false;}
});
document.getElementById('lore-editor-reset').addEventListener('click',resetLoreEditor);
function resetMedalEditor(){
 const form=document.getElementById('medal-catalog-form');form.reset();
 document.getElementById('medal-catalog-id').value='';
 document.getElementById('medal-editor-heading').textContent='Crear una medalla';
 document.getElementById('medal-active').checked=true;
 document.getElementById('medal-icon').value='✦';
 document.getElementById('medal-sort-order').value=0;
 say('medal-editor-feedback','');
}
async function loadMedalAdmin(){
 const host=document.getElementById('medal-catalog-list');if(!host)return;
 const {data,error}=await db.from('medal_catalog').select('*').order('sort_order').order('name');
 if(error){host.textContent=error.message;return;}
 host.innerHTML=(data||[]).map(m=>'<div class="library-row"><span><b>'+escapeHtml(m.icon)+' '+escapeHtml(m.name)+'</b><small>'+escapeHtml(m.description)+' · '+(m.active?'ACTIVA':'INACTIVA')+'</small></span><span class="library-row-actions"><button type="button" class="button button-outline-dark" data-edit-medal="'+m.id+'">Editar</button><button type="button" class="button button-outline-dark" data-toggle-medal="'+m.id+'" data-active="'+m.active+'">'+(m.active?'Desactivar':'Activar')+'</button></span></div>').join('')||'<p>No hay medallas creadas.</p>';
 host.querySelectorAll('[data-edit-medal]').forEach(button=>button.addEventListener('click',()=>editMedal(data.find(m=>m.id===button.dataset.editMedal))));
 host.querySelectorAll('[data-toggle-medal]').forEach(button=>button.addEventListener('click',async()=>{
  const active=button.dataset.active!=='true';const {error}=await db.from('medal_catalog').update({active,updated_at:new Date().toISOString()}).eq('id',button.dataset.toggleMedal);
  if(error){say('medal-editor-feedback',error.message);return;}await loadMedalAdmin();
 }));
}
function editMedal(m){
 if(!m)return;
 document.getElementById('medal-catalog-id').value=m.id;
 document.getElementById('medal-code').value=m.code;
 document.getElementById('medal-name').value=m.name;
 document.getElementById('medal-icon').value=m.icon;
 document.getElementById('medal-description').value=m.description;
 document.getElementById('medal-sort-order').value=m.sort_order;
 document.getElementById('medal-active').checked=m.active;
 document.getElementById('medal-editor-heading').textContent='Editar medalla';
 say('medal-editor-feedback','Editando: '+m.name);
 document.getElementById('medal-catalog-form').scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('medal-catalog-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;
 try{
  const id=document.getElementById('medal-catalog-id').value;
  const payload={code:document.getElementById('medal-code').value.trim().toLowerCase(),name:document.getElementById('medal-name').value.trim(),icon:document.getElementById('medal-icon').value.trim(),description:document.getElementById('medal-description').value.trim(),sort_order:Number(document.getElementById('medal-sort-order').value)||0,active:document.getElementById('medal-active').checked,updated_at:new Date().toISOString()};
  const result=id?await db.from('medal_catalog').update(payload).eq('id',id):await db.from('medal_catalog').insert(payload);
  if(result.error)throw result.error;
  say('medal-editor-feedback',id?'Medalla actualizada.':'Medalla creada.');
  resetMedalEditor();await loadMedalAdmin();
 }catch(err){say('medal-editor-feedback',err.message||'No se pudo guardar la medalla.');}
 finally{button.disabled=false;}
});
document.getElementById('medal-editor-reset').addEventListener('click',resetMedalEditor);
initRichEditors();

async function loadLoreChronicleAdmin(){
 const host=document.getElementById('lore-chronicle-admin-list');if(!host)return;
 const {data,error}=await db.from('lore_chronicle').select('*').eq('entry_type','manual').order('sort_order',{ascending:true});
 if(error){host.textContent=error.message;return;}
 host.innerHTML='<h4>Capítulos manuales</h4>'+((data||[]).map(entry=>'<div class="library-row"><span><b>'+escapeHtml(entry.title)+'</b></span><span class="library-row-actions"><button type="button" class="button button-outline-dark" data-edit-chronicle="'+entry.id+'">Editar</button><button type="button" class="button button-outline-dark" data-delete-chronicle="'+entry.id+'">Eliminar</button></span></div>').join('')||'<p>Aún no hay capítulos manuales.</p>');
 host.querySelectorAll('[data-edit-chronicle]').forEach(button=>button.addEventListener('click',()=>editChronicleEntry(data.find(x=>x.id===button.dataset.editChronicle))));
 host.querySelectorAll('[data-delete-chronicle]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('¿Eliminar este capítulo manual del lore?'))return;const {error}=await db.from('lore_chronicle').delete().eq('id',button.dataset.deleteChronicle).eq('entry_type','manual');if(error){say('lore-chronicle-feedback',error.message);return;}await Promise.all([loadLoreChronicleAdmin(),loadLoreChronicle()]);}));
}
function resetChronicleEditor(){const form=document.getElementById('lore-chronicle-form');form.reset();document.getElementById('lore-chronicle-id').value='';document.getElementById('lore-chronicle-cover-existing').value='';document.getElementById('lore-chronicle-cover-preview').innerHTML='';document.getElementById('lore-chronicle-editor').innerHTML='';document.getElementById('lore-chronicle-heading').textContent='Añadir al lore oficial';say('lore-chronicle-feedback','');}
function editChronicleEntry(entry){if(!entry)return;document.getElementById('lore-chronicle-id').value=entry.id;document.getElementById('lore-chronicle-title').value=entry.title;document.getElementById('lore-chronicle-cover-existing').value=entry.cover_image_path||'';const cover=entry.cover_image_path?db.storage.from('smial-media').getPublicUrl(entry.cover_image_path).data.publicUrl:'';document.getElementById('lore-chronicle-cover-preview').innerHTML=cover?'<img src="'+escapeHtml(cover)+'" alt="Imagen actual">':'';document.getElementById('lore-chronicle-editor').innerHTML=richEditorValue(entry.content);document.getElementById('lore-chronicle-heading').textContent='Editar capítulo del lore';say('lore-chronicle-feedback','Editando capítulo: '+entry.title);document.getElementById('lore-chronicle-form').scrollIntoView({behavior:'smooth',block:'start'});}
document.getElementById('lore-chronicle-form').addEventListener('submit',async e=>{e.preventDefault();const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;try{const title=document.getElementById('lore-chronicle-title').value.trim();const content=sanitizeRich(document.getElementById('lore-chronicle-editor').innerHTML);if(!content.trim())throw new Error('Escribe el contenido del capítulo.');let cover=document.getElementById('lore-chronicle-cover-existing').value||null;const file=document.getElementById('lore-chronicle-cover').files[0];if(file)cover=await uploadImage(file,'lore-covers');const id=document.getElementById('lore-chronicle-id').value;const payload={title,content,cover_image_path:cover,entry_type:'manual'};const result=id?await db.from('lore_chronicle').update(payload).eq('id',id).eq('entry_type','manual'):await db.from('lore_chronicle').insert(payload);if(result.error)throw result.error;say('lore-chronicle-feedback',id?'Capítulo actualizado.':'Capítulo añadido al lore oficial.');resetChronicleEditor();await Promise.all([loadLoreChronicleAdmin(),loadLoreChronicle()]);}catch(err){say('lore-chronicle-feedback',err.message||'No se pudo guardar el capítulo.');}finally{button.disabled=false;}});
document.getElementById('lore-chronicle-reset').addEventListener('click',resetChronicleEditor);
async function loadActiveShadowEvent(){const host=document.getElementById('shadow-active-event');if(!host)return;const {data,error}=await db.from('events').select('id,title,description,event_date,event_time,location,lore_title,lore_intro,lore_cover_image_path').eq('status','published').eq('attendance_closed',false).not('lore_scenario_id','is',null).order('event_date',{ascending:true}).limit(1).maybeSingle();if(error){host.textContent='No fue posible cargar el acontecimiento activo.';return;}if(!data){host.innerHTML='<p>No hay acontecimientos activos. El próximo capítulo de la historia está por comenzar.</p>';return;}const cover=data.lore_cover_image_path?db.storage.from('smial-media').getPublicUrl(data.lore_cover_image_path).data.publicUrl:'';host.innerHTML='<article class="shadow-active-card"><p class="card-kicker">ACONTECIMIENTO ACTIVO</p><h3>'+escapeHtml(data.lore_title||data.title)+'</h3><p>'+escapeHtml(data.description)+'</p>'+(cover?'<img class="event-lore-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(data.lore_intro||'')+'</div><small>'+escapeHtml(data.event_date)+(data.event_time?' · '+escapeHtml(data.event_time.slice(0,5)):'')+' · '+escapeHtml(data.location)+'</small><p class="shadow-pending">PENDIENTE DE RESOLUCIÓN</p></article>';}
async function loadShadowState(){
 const [{data:state,error},{count:total},{count:consumed}] = await Promise.all([
  db.from('smial_state').select('*').eq('id',1).single(),
  db.from('characters').select('id',{count:'exact',head:true}).eq('status','approved'),
  db.from('characters').select('id',{count:'exact',head:true}).eq('status','approved').lt('hope_level',3)
 ]);
 if(error)return;
 document.getElementById('smial-light').textContent=state.light_level+'/10';
 document.getElementById('smial-shadow').textContent=state.shadow_level+'/10';
 document.getElementById('smial-light-bar').style.width=(state.light_level*10)+'%';
 document.getElementById('smial-shadow-bar').style.width=(state.shadow_level*10)+'%';
 document.getElementById('smial-state-label').textContent=state.light_level<3?'EL SMIAL ESTÁ CONSUMIDO':state.shadow_level>state.light_level?'LA SOMBRA DOMINA':state.light_level>state.shadow_level?'LA ESPERANZA RESISTE':'ESPERANZA Y SOMBRA ESTÁN EN EQUILIBRIO';
 document.getElementById('smial-counts').textContent=(total||0)+' personajes aprobados · '+(consumed||0)+' consumidos · Marcas pendientes: '+state.light_marks+' de Esperanza y '+state.shadow_marks+' de Sombra.';
 await loadActiveShadowEvent();
}
loadApproved();loadEvents();loadLoreChronicle();loadLoreScenarios();loadShadowState();loadSiteSettings();refreshAdmin();
