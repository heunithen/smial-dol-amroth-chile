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
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Formato no permitido. Usa JPG, PNG o WebP.');
 if(file.size>5*1024*1024)throw new Error('La imagen supera el límite de 5 MB.');
 const ext=file.type==='image/jpeg'?'jpg':file.type.split('/')[1];
 const path=folder+'/'+crypto.randomUUID()+'.'+ext;
 const {error}=await db.storage.from('smial-media').upload(path,file,{contentType:file.type,upsert:false});
 if(error)throw error;
 return path;
};
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
  const payload={real_name:document.getElementById('real-name').value.trim(),tolkien_name:document.getElementById('tolkien-name').value.trim(),role_title:document.getElementById('character-role').value.trim(),story:story.value.trim(),achievements:document.getElementById('character-achievements').value.trim(),image_path,status:'pending'};
  const {error}=await db.from('characters').insert(payload);if(error)throw error;
  charForm.reset();say('story-count','0/1000');say('character-feedback','Solicitud enviada. Quedará pendiente hasta que un administrador la revise.');
 }catch(err){say('character-feedback',err.message||'No se pudo enviar la solicitud.');}finally{button.disabled=false;}
});
async function loadApproved(){
 const host=document.getElementById('approved-members');if(!host)return;
 const {data,error}=await db.from('characters').select('id,real_name,tolkien_name,role_title,story,achievements,image_path,hope_level,shadow_level').eq('status','approved').order('reviewed_at',{ascending:false});
 if(error){host.textContent='No fue posible cargar los personajes.';return;}
 host.innerHTML=data.map(c=>{const image=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;return '<article class="approved-card"><img src="'+image+'" alt=""><div><h3>'+escapeHtml(c.tolkien_name)+'</h3><p class="card-kicker">'+escapeHtml(c.role_title)+' · '+escapeHtml(c.real_name)+'</p><div class="character-levels"><span>Esperanza <b>'+c.hope_level+'/10</b></span><span>Sombra <b>'+c.shadow_level+'/10</b></span></div>'+(c.hope_level<3?'<p class="consumed-label">CONSUMIDO · ANTAGONISTA</p>':'')+'<p>'+escapeHtml(c.story)+'</p>'+(c.achievements?'<p><strong>Logros:</strong> '+escapeHtml(c.achievements)+'</p>':'')+'</div></article>';}).join('')||'<div class="members-empty"><div class="empty-crest">✧</div><h3>Las primeras historias están por llegar</h3><p>Los personajes aparecerán aquí una vez aprobados.</p></div>';
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
async function loadEvents(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').gte('event_date',new Date().toISOString().slice(0,10)).order('event_date');
 if(error)return;
 host.innerHTML=data.map(ev=>'<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3><p>'+escapeHtml(ev.description)+'</p><small>'+escapeHtml(ev.location)+'</small></article>').join('');
}
const loginForm=document.getElementById('login-form');
async function refreshAdmin(){
 const {data:{session}}=await db.auth.getSession();
 const authBox=document.getElementById('auth-box'),dashboard=document.getElementById('admin-dashboard');
 if(!session){authBox.hidden=false;dashboard.hidden=true;return;}
 const role=session.user.app_metadata?.role;
 if(role!=='admin'){authBox.hidden=false;dashboard.hidden=true;say('auth-feedback','La sesión está iniciada, pero este correo aún no tiene permisos de administrador. Contacta al responsable del proyecto.');return;}
 authBox.hidden=true;dashboard.hidden=false;say('admin-identity','Sesión: '+session.user.email);
 await Promise.all([loadPending(),loadAdminEvents()]);
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
 host.innerHTML=data.map(c=>{const image=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;return '<article class="admin-item"><img src="'+image+'" alt=""><div><h4>'+escapeHtml(c.tolkien_name)+' — '+escapeHtml(c.real_name)+'</h4><p><b>'+escapeHtml(c.role_title)+'</b></p><p>'+escapeHtml(c.story)+'</p><p>Logros: '+escapeHtml(c.achievements)+'</p><button data-review="approved" data-id="'+c.id+'" class="button button-dark">Aprobar</button> <button data-review="rejected" data-id="'+c.id+'" class="button button-outline-dark">Rechazar</button></div></article>';}).join('')||'<p>No hay solicitudes pendientes.</p>';
 host.querySelectorAll('[data-review]').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;const {error}=await db.from('characters').update({status:button.dataset.review,reviewed_at:new Date().toISOString()}).eq('id',button.dataset.id);if(error)alert(error.message);await loadPending();await loadApproved();}));
}
const eventForm=document.getElementById('event-form');
eventForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=eventForm.querySelector('button');button.disabled=true;say('event-feedback','Publicando...');
 try{
  const file=document.getElementById('event-image').files[0];const image_path=file?await uploadImage(file,'events'):null;
  const {error}=await db.from('events').insert({title:document.getElementById('event-title').value.trim(),description:document.getElementById('event-description').value.trim(),event_date:document.getElementById('event-date').value,event_time:document.getElementById('event-time').value||null,location:document.getElementById('event-location').value.trim(),image_path,status:'published'});
  if(error)throw error;eventForm.reset();say('event-feedback','Evento publicado.');await loadAdminEvents();await loadEvents();
 }catch(err){say('event-feedback',err.message||'No se pudo publicar.');}finally{button.disabled=false;}
});
async function loadAdminEvents(){
 const host=document.getElementById('admin-events');const {data,error}=await db.from('events').select('*').order('event_date',{ascending:false});
 if(error){host.textContent=error.message;return;}
 host.innerHTML=data.map(ev=>'<article class="admin-event"><div><strong>'+escapeHtml(ev.title)+'</strong><small>'+escapeHtml(ev.event_date)+' · '+escapeHtml(ev.location)+' · '+escapeHtml(ev.status)+(ev.attendance_closed?' · asistencia cerrada':'')+'</small></div><div class="admin-event-actions">'+(ev.status==='published'&&!ev.attendance_closed?'<button class="button button-outline-dark" data-attendance-event="'+ev.id+'">Registrar asistencia</button>':'')+'<button class="button button-outline-dark" data-delete-event="'+ev.id+'">Eliminar</button></div></article>').join('')||'<p>No hay eventos.</p>';
 host.querySelectorAll('[data-attendance-event]').forEach(button=>button.addEventListener('click',()=>openAttendance(button.dataset.attendanceEvent)));
 host.querySelectorAll('[data-delete-event]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('¿Eliminar este evento?'))return;const {error}=await db.from('events').delete().eq('id',button.dataset.deleteEvent);if(error)alert(error.message);await loadAdminEvents();await loadEvents();}));
}
async function openAttendance(eventId){
 const host=document.getElementById('attendance-manager');host.textContent='Cargando personajes...';
 const [{data:characters,error:charError},{data:existing,error:attendanceError},{data:eventRow}] = await Promise.all([
  db.from('characters').select('id,tolkien_name,role_title,hope_level,shadow_level').eq('status','approved').order('tolkien_name'),
  db.from('event_attendance').select('character_id,attended').eq('event_id',eventId),
  db.from('events').select('title,attendance_closed').eq('id',eventId).single()
 ]);
 if(charError||attendanceError||!eventRow){host.textContent=(charError||attendanceError)?.message||'No se pudo cargar el evento.';return;}
 if(eventRow.attendance_closed){host.textContent='La asistencia de este evento ya fue cerrada.';return;}
 const present=new Set((existing||[]).filter(row=>row.attended).map(row=>row.character_id));
 host.innerHTML='<h4>'+escapeHtml(eventRow.title)+'</h4><p>Marca únicamente a los personajes que asistieron. Los demás se registrarán como ausentes al cerrar el evento.</p><form id="attendance-form"><div class="attendance-list">'+characters.map(c=>'<label><input type="checkbox" name="attended" value="'+c.id+'" '+(present.has(c.id)?'checked':'')+'><span><strong>'+escapeHtml(c.tolkien_name)+'</strong><small>'+escapeHtml(c.role_title)+(c.hope_level<3?' · CONSUMIDO':'')+'</small></span></label>').join('')+'</div><button class="button button-dark" type="submit">Guardar asistencia</button> <button class="button button-outline-dark" id="close-attendance" type="button">Cerrar evento y aplicar cambios</button><p id="attendance-feedback" class="form-feedback" role="status"></p></form>';
 const form=document.getElementById('attendance-form');
 form.addEventListener('submit',async e=>{e.preventDefault();const ids=[...form.querySelectorAll('input[name="attended"]:checked')].map(input=>input.value);const rows=characters.map(c=>({event_id:eventId,character_id:c.id,attended:ids.includes(c.id)}));const {error}=await db.from('event_attendance').upsert(rows,{onConflict:'event_id,character_id'});say('attendance-feedback',error?'Error: '+error.message:'Asistencia guardada. Todavía puedes modificarla antes de cerrar el evento.');});
 document.getElementById('close-attendance').addEventListener('click',async()=>{
  if(!confirm('Al cerrar el evento se aplicarán los cambios a todos los personajes aprobados. Esta operación no se puede deshacer. ¿Continuar?'))return;
  const ids=[...form.querySelectorAll('input[name="attended"]:checked')].map(input=>input.value);
  const rows=characters.map(c=>({event_id:eventId,character_id:c.id,attended:ids.includes(c.id)}));
  const {error:saveError}=await db.from('event_attendance').upsert(rows,{onConflict:'event_id,character_id'});
  if(saveError){say('attendance-feedback','Error guardando asistencia: '+saveError.message);return;}
  const {error:closeError}=await db.from('events').update({attendance_closed:true}).eq('id',eventId);
  if(closeError){say('attendance-feedback','Error cerrando evento: '+closeError.message);return;}
  host.textContent='Evento cerrado. Se actualizaron los valores de los personajes y del Smial.';
  await Promise.all([loadAdminEvents(),loadApproved(),loadShadowState()]);
 });
}
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
}
loadApproved();loadEvents();loadShadowState();refreshAdmin();
