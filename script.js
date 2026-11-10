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
async function loadEvents(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').order('event_date',{ascending:true});
 if(error)return;
 host.innerHTML=data.map(ev=>'<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3><p>'+escapeHtml(ev.description)+'</p><small>'+escapeHtml(ev.location)+'</small>'+(ev.lore_title?'<div class="event-lore"><span>CRÓNICA DEL SMIAL</span><h4>'+escapeHtml(ev.lore_title)+'</h4><p>'+escapeHtml(ev.lore_intro||'')+'</p>'+(ev.lore_resolution?'<div class="event-resolution"><b>'+escapeHtml((ev.lore_outcome||'').toUpperCase())+'</b><p>'+escapeHtml(ev.lore_resolution)+'</p></div>':'<small>El desenlace se conocerá al cerrar el evento.</small>')+'</div>':'')+'</article>').join('');
}
async function loadLoreScenarios(){
 const select=document.getElementById('event-lore-scenario');if(!select)return;
 const {data,error}=await db.from('lore_scenarios').select('id,name').eq('active',true).order('name');
 if(error){select.innerHTML='<option value="">No se pudieron cargar las historias</option>';return;}
 select.innerHTML='<option value="">Elegir una historia al azar</option>'+(data||[]).map(s=>'<option value="'+s.id+'">'+escapeHtml(s.name)+'</option>').join('');
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
 e.preventDefault();const button=eventForm.querySelector('button[type="submit"]');button.disabled=true;say('event-feedback','Preparando evento y crónica...');
 try{
  const file=document.getElementById('event-image').files[0];const image_path=file?await uploadImage(file,'events'):null;
  const {data:scenarios,error:scenarioError}=await db.from('lore_scenarios').select('*').eq('active',true);
  if(scenarioError)throw scenarioError;
  if(!scenarios?.length)throw new Error('No hay historias preconfiguradas activas.');
  const selectedId=document.getElementById('event-lore-scenario').value;
  const scenario=selectedId?scenarios.find(s=>s.id===selectedId):scenarios[Math.floor(Math.random()*scenarios.length)];
  if(!scenario)throw new Error('No se pudo seleccionar una historia.');
  const payload={title:document.getElementById('event-title').value.trim(),description:document.getElementById('event-description').value.trim(),event_date:document.getElementById('event-date').value,event_time:document.getElementById('event-time').value||null,location:document.getElementById('event-location').value.trim(),image_path,status:'published',lore_scenario_id:scenario.id,lore_title:scenario.name,lore_intro:scenario.intro,lore_low_resolution:scenario.low_resolution,lore_partial_resolution:scenario.partial_resolution,lore_success_resolution:scenario.success_resolution,lore_partial_threshold:scenario.partial_threshold,lore_success_threshold:scenario.success_threshold};
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
  host.innerHTML='<h4>Evento cerrado</h4><p>Se actualizaron los valores de Esperanza y Sombra del Smial y de sus personajes.</p>'+(closedEvent?.lore_resolution?'<div class="event-resolution admin-resolution"><b>'+escapeHtml((closedEvent.lore_outcome||'').toUpperCase())+' · PUNTUACIÓN '+closedEvent.lore_score+'</b><p>'+escapeHtml(closedEvent.lore_resolution)+'</p></div>':'<p>El evento no tenía una crónica asociada.</p>');
  await Promise.all([loadAdminEvents(),loadApproved(),loadShadowState(),loadEvents()]);
 });
 await loadEventMedalManager(eventId,characters);
}
async function loadEventMedalManager(eventId,characters){
 const [{data:catalog,error:catalogError},{data:awards,error:awardsError}]=await Promise.all([
  db.from('medal_catalog').select('id,name,description,icon').eq('active',true).order('sort_order'),
  db.from('character_medals').select('id,character_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at')
 ]);
 const type=document.getElementById('medal-type'),list=document.getElementById('event-medal-awards');
 if(catalogError||awardsError){list.textContent=(catalogError||awardsError).message;return;}
 type.innerHTML=(catalog||[]).map(m=>'<option value="'+m.id+'">'+escapeHtml(m.icon)+' '+escapeHtml(m.name)+' — '+escapeHtml(m.description)+'</option>').join('');
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
loadApproved();loadEvents();loadLoreScenarios();loadShadowState();refreshAdmin();
