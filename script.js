// Versión 2.7.43
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
const imageToWebP=async(file)=>{
 const loadFallback=()=>new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file);const image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve({source:image,width:image.naturalWidth,height:image.naturalHeight});};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo leer la imagen seleccionada.'));};
  image.src=url;
 });
 let source,width,height,bitmap=null;
 try{
  if(typeof createImageBitmap==='function'){
   bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
   source=bitmap;width=bitmap.width;height=bitmap.height;
  }else ({source,width,height}=await loadFallback());
  if(!width||!height)throw new Error('La imagen no tiene dimensiones válidas.');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d');
  if(!context)throw new Error('Este navegador no permite convertir la imagen.');
  context.drawImage(source,0,0,width,height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82));
  if(!blob||blob.type!=='image/webp')throw new Error('El navegador no pudo generar una imagen WebP.');
  const base=(file.name||'imagen').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-')||'imagen';
  return new File([blob],base+'.webp',{type:'image/webp',lastModified:Date.now()});
 }finally{if(bitmap)bitmap.close();}
};
const uploadImage=async(file,folder)=>{
 if(!file)return null;
 const mimeByExt={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
 const extFromName=(file.name||'').split('.').pop().toLowerCase();
 const contentType=['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:mimeByExt[extFromName];
 if(!contentType)throw new Error('Formato no permitido. El archivo debe ser JPG, PNG o WebP. Formato detectado: '+(file.type||extFromName||'desconocido'));
 if(file.size>5*1024*1024)throw new Error('La imagen original pesa '+(file.size/1024/1024).toFixed(2)+' MB y el límite actual es 5 MB. Reduce su tamaño e inténtalo otra vez.');
 const converted=await imageToWebP(file);
 const randomName=(globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const path=folder+'/'+randomName+'.webp';
 const {data,error}=await db.storage.from('smial-media').upload(path,converted,{contentType:'image/webp',upsert:false,cacheControl:'3600'});
 if(error){
  console.error('Error de carga en Supabase Storage:',{message:error.message,statusCode:error.statusCode,error:error.error,name:error.name,path});
  throw new Error('Supabase Storage rechazó la imagen. '+(error.message||error.error||'Error sin detalle')+(error.statusCode?' (HTTP '+error.statusCode+')':''));
 }
 if(!data?.path)throw new Error('Supabase no confirmó la ruta del archivo. Vuelve a intentarlo.');
 return data.path;
};

const SITE_DEFAULTS={"announcement":"Un hogar para quienes mantienen viva la llama de la Tierra Media","site_title":"SMIAL DOL AMROTH","brand_subtitle":"CHILE · TIERRA MEDIA","hero_eyebrow":"GONDOR · BELFALAS · CHILE","hero_title":"Donde el mar\nencuentra la leyenda.","hero_intro":"Somos el Smial Dol Amroth de Chile: una comunidad que celebra la obra de J. R. R. Tolkien, comparte historias y construye nuevas aventuras en compañía.","hero_caption":"EN LAS COSTAS DE BELFALAS · UNA COMUNIDAD, MUCHAS HISTORIAS","hero_seal_title":"DOL\nAMROTH","hero_seal_subtitle":"EST. IN MIDDLE-EARTH","lore_title":"Una historia junto\nal Gran Mar.","lore_intro":"Inspirados por las costas de Gondor y el legado de sus gentes, encontramos en la Tierra Media un lugar para imaginar, aprender y compartir.","events_title":"Las historias\nse viven juntos.","events_intro":"Reuniones, conversaciones, lecturas y actividades para compartir nuestra afición por Tolkien.","members_title":"Rostros e historias\nde nuestra casa.","members_intro":"Cada integrante puede dar vida a un personaje con identidad, historia y lugar dentro del universo narrativo del Smial. Las Medallas de Dol Amroth reconocen la ayuda, la iniciativa, la organización y los aportes que fortalecen nuestra comunidad.","shadow_title":"La Sombra\nse extiende.","shadow_intro":"Desde el Este crece una amenaza. La Sombra de Mordor se cierne sobre nuestras tierras y solo la unión de la comunidad podrá mantenerla a raya.","shadow_eyebrow":"04 / CRÓNICAS DE LA RESISTENCIA","shadow_chronicle_text":"Cada reunión y cada evento en que participamos representa un paso más en esta resistencia colectiva. Cada encuentro activa una crónica ficticia cuyo desenlace depende de la asistencia y de los logros reconocidos con medallas. Nuestras acciones fuera de la historia alimentan las hazañas de nuestros personajes dentro de ella.","shadow_event_empty":"No hay acontecimientos activos.","shadow_rules_title":"Esperanza y Sombra","shadow_rules_text":"Cada personaje y el Smial tienen una reserva común de 10 puntos: Esperanza + Sombra = 10. Todos comienzan con 7 de Esperanza y 3 de Sombra. Cada punto que pierde la Esperanza lo gana la Sombra, y viceversa. El mínimo es 1 de Esperanza y el máximo 9 de Sombra.","shadow_level_1_title":"SOMBRA 9 — EL DOMINIO DE LA SOMBRA","shadow_level_1_text":"La Sombra ha alcanzado su máxima influencia sobre el principado. El miedo y la desesperación consumen la voluntad de sus habitantes, la ambición y la crueldad prevalecen sobre la compasión y los antiguos vínculos parecen haber perdido su significado. La esperanza apenas encuentra refugio en algunos corazones y la voluntad de resistir se encuentra profundamente debilitada. Las tierras pueden conservar sus murallas y sus estandartes, pero su espíritu parece sometido a la oscuridad.","shadow_level_2_title":"SOMBRA 8 — LA VOLUNTAD QUEBRANTADA","shadow_level_2_text":"La oscuridad ha penetrado profundamente en la vida del principado. El temor gobierna muchas decisiones, la codicia enfrenta a quienes antes compartían un mismo propósito y la desesperanza debilita incluso a los más decididos. Los actos de crueldad se vuelven menos sorprendentes y la confianza entre los habitantes resulta cada vez más difícil de encontrar. La Sombra no necesita conquistar todas las fortalezas cuando puede dominar las voluntades de quienes las habitan.","shadow_level_3_title":"SOMBRA 7 — EL PESO DE LA OSCURIDAD","shadow_level_3_text":"La influencia de la Sombra se hace cada vez más evidente. El miedo debilita la voluntad de los habitantes, la desconfianza separa a las comunidades y los intereses personales comienzan a prevalecer sobre el bien común. La crueldad y la ambición encuentran terreno fértil, mientras los actos de bondad parecen perder importancia. Las tierras conservan su apariencia, pero el espíritu de sus gentes comienza a cambiar.","shadow_level_4_title":"SOMBRA 6 — SUSURROS EN LA DISTANCIA","shadow_level_4_text":"Una inquietud difícil de explicar comienza a sentirse en las tierras del principado. La desconfianza se abre paso entre sus habitantes, los rumores alimentan los temores y la codicia comienza a imponerse sobre la generosidad. Algunos olvidan sus deberes y otros prefieren mirar hacia otro lado ante las dificultades ajenas. La influencia de la Sombra todavía es discreta, pero ya encuentra lugar en los corazones de quienes habitan estas tierras.","shadow_level_5_title":"ESPERANZA Y SOMBRA — EN EQUILIBRIO","shadow_level_5_text":"La influencia de la Sombra y la voluntad de resistir se encuentran en equilibrio. En las tierras del principado conviven la desconfianza y la lealtad, el temor y el valor, la ambición y la generosidad. Ninguna de estas fuerzas prevalece por completo. El destino de Dol Amroth permanece abierto y depende de las decisiones y acciones de sus habitantes.","shadow_level_6_title":"ESPERANZA 6 — LA LLAMA QUE PERMANECE","shadow_level_6_text":"Incluso en tiempos difíciles, la Sombra no ha conseguido apagar toda esperanza. Todavía existen habitantes que conservan su palabra, protegen a los débiles y se niegan a abandonar sus principios. La amistad y la lealtad permanecen como pequeñas luces frente a la oscuridad. No siempre es fácil distinguir el camino correcto, pero aún hay quienes encuentran fuerzas para resistir la desesperanza y recordar aquello que merece ser defendido.","shadow_level_7_title":"ESPERANZA 7 — LA FORTALEZA DE LOS CORAZONES","shadow_level_7_text":"La voluntad de los habitantes comienza a imponerse sobre la influencia de la Sombra. La lealtad recupera su valor, la generosidad encuentra espacio y las comunidades vuelven a reconocer la importancia de permanecer unidas. El miedo no ha desaparecido, pero ya no determina todas las decisiones. Quienes conservan sus principios encuentran fuerzas para ayudar a otros y enfrentar las tentaciones de la oscuridad.","shadow_level_8_title":"ESPERANZA 8 — LA LUZ DE LA RESISTENCIA","shadow_level_8_text":"El espíritu del principado se encuentra fortalecido. La confianza, la amistad y el sentido del deber prevalecen sobre la codicia y la desconfianza. Sus habitantes demuestran una voluntad firme frente a las dificultades y no permiten que el temor determine su destino. La Sombra todavía existe y sus tentaciones no han desaparecido, pero encuentra una resistencia cada vez mayor en quienes recuerdan el valor de la compasión, la lealtad y el sacrificio.","shadow_level_9_title":"ESPERANZA 9 — LA LUZ QUE NO SE APAGA","shadow_level_9_text":"El espíritu de Dol Amroth resplandece con fuerza. Sus habitantes conservan la esperanza, honran sus compromisos y permanecen unidos frente a las dificultades. La generosidad supera a la codicia, la compasión prevalece sobre la crueldad y el valor permite enfrentar incluso los temores más profundos. La Sombra nunca desaparece por completo de la Tierra Media, pero encuentra en estas tierras corazones firmes que se niegan a entregarse a ella. La luz de Dol Amroth permanece viva.","about_title":"Una casa para\nla imaginación.","about_intro":"El Smial Dol Amroth de Chile es un espacio de encuentro para personas que comparten su interés por el legendarium de J. R. R. Tolkien. Nos reúne la lectura, la conversación, la creatividad y el gusto por construir comunidad.","about_text":"Queremos que este sitio sea la puerta de entrada a nuestras actividades y también el archivo vivo de las historias que vamos creando como grupo.","register_title":"Hay sitio en la mesa\npara una historia más.","register_intro":"¿Quieres formar parte del Smial? Completa tus datos para solicitar ingreso. La administración revisará tu solicitud y, si la aprueba, podrás ingresar con tu correo y contraseña.","footer_text":"Una comunidad inspirada en la obra de J. R. R. Tolkien.","paper":"#f4f2ed","ink":"#1a2939","announcement_text_color":"#c4ccd5","lore_card_background":"#efeee9","lore_card_title_color":"#20364d","lore_card_text_color":"#465766","lore_card_label_color":"#9a8558","lore_card_border_color":"#d6d9d6","nav_text_color":"#455363","nav_active_color":"#9b8355","nav_register_text_color":"#203a55","nav_register_border_color":"#9caaaf","heading_color":"#101f35","text_color":"#1a2939","muted_color":"#687582","border_color":"#c8d2dc","navy":"#101f35","blue":"#24486b","gold":"#b9a477","serif":"Cinzel","sans":"Manrope","hero_image_path":"","logo_image_path":"","about_logo_image_path":"","shadow_background_image_path":"","global_content_width":1120,"global_section_spacing":76,"global_radius":8,"home_overlay":65,"home_height":720,"home_title_size":78,"home_intro_size":15,"home_content_width":650,"home_seal_size":150,"lore_bg":"#111b2b","lore_title_color":"#f4f6f8","lore_text_color":"#b6c0cb","lore_card_radius":8,"lore_text_size":17,"lore_content_width":1100,"lore_section_padding":76,"events_bg":"#0b1728","events_title_color":"#f0f1ee","events_text_color":"#bac5cd","events_card_bg":"#14283f","events_card_radius":8,"events_image_height":300,"events_section_padding":76,"members_bg":"#111b2b","members_title_color":"#f4f6f8","members_text_color":"#b6c0cb","members_card_bg":"#1a293c","members_card_radius":8,"members_image_size":180,"shadow_bg":"#0a1523","shadow_title_color":"#edf0ec","shadow_text_color":"#b9c3ca","shadow_card_bg":"#101b29","shadow_art_height":460,"shadow_overlay":55,"about_bg":"#111b2b","about_title_color":"#f4f6f8","about_text_color":"#b6c0cb","about_emblem_size":338,"about_section_padding":76,"register_bg":"#101f35","register_title_color":"#f4f6f8","register_text_color":"#c1cbd2","register_form_bg":"#172b40","register_input_bg":"#29415a","register_input_text":"#f5f6f7","register_input_border":"#596a7a","register_button_bg":"#b9a477","register_button_text":"#101f35","register_radius":8,"header_bg":"#f8f7f3","header_height":88,"header_logo_size":110,"announcement_bg":"#0a1627","announcement_bg_text":"#c4ccd5","announcement_height":34,"footer_bg":"#101f35","footer_text_color":"#d2d9df","button_bg":"#0b1728","button_text":"#f5f6f7","button_border":"#294763","button_radius":4,"input_bg":"#29415a","input_text":"#f5f6f7","input_border":"#596a7a","input_radius":6};
let siteSettings={...SITE_DEFAULTS};

const DESIGN_CONTROLS={"general":[["paper","Fondo general","color"],["heading_color","Color de títulos","color"],["text_color","Texto principal","color"],["muted_color","Texto secundario","color"],["border_color","Bordes y separadores","color"],["announcement_text_color","Texto de la franja superior","color"],["navy","Azul oscuro institucional","color"],["blue","Azul secundario","color"],["gold","Dorado institucional","color"],["serif","Tipografía de títulos","select",["Cinzel","Georgia"]],["sans","Tipografía general","select",["Manrope","Arial","Georgia"]],["global_content_width","Ancho máximo del contenido (px)","number",600,1600],["global_section_spacing","Separación vertical general (px)","number",20,160],["global_radius","Redondeo general de tarjetas (px)","number",0,32]],"home":[["home_overlay","Oscurecimiento de la imagen (%)","number",0,90],["home_height","Altura de portada (px)","number",420,1000],["home_title_size","Tamaño del título (px)","number",32,110],["home_intro_size","Tamaño de presentación (px)","number",12,26],["home_content_width","Ancho del bloque de texto (px)","number",350,1000],["home_seal_size","Tamaño del sello circular (px)","number",80,260]],"lore":[["lore_bg","Fondo de la sección","color"],["lore_title_color","Color del título","color"],["lore_text_color","Color del texto","color"],["lore_card_background","Fondo de las entradas","color"],["lore_card_title_color","Título de las entradas","color"],["lore_card_text_color","Texto de las entradas","color"],["lore_card_label_color","Etiquetas y fechas","color"],["lore_card_border_color","Borde de las entradas","color"],["lore_text_size","Tamaño del texto narrativo (px)","number",12,24],["lore_content_width","Ancho máximo del contenido (px)","number",500,1400],["lore_section_padding","Espaciado interior (px)","number",20,160],["lore_card_radius","Redondeo de tarjetas (px)","number",0,32]],"events":[["events_bg","Fondo de la sección","color"],["events_title_color","Color de títulos","color"],["events_text_color","Color del texto","color"],["events_card_bg","Fondo de tarjetas de eventos","color"],["events_card_radius","Redondeo de tarjetas (px)","number",0,32],["events_image_height","Altura máxima de imágenes (px)","number",100,700],["events_section_padding","Espaciado interior (px)","number",20,160]],"members":[["members_bg","Fondo de la sección","color"],["members_title_color","Color de títulos","color"],["members_text_color","Color del texto","color"],["members_card_bg","Fondo de fichas de personajes","color"],["members_card_radius","Redondeo de fichas (px)","number",0,32],["members_image_size","Tamaño de imagen de personaje (px)","number",80,320]],"shadow":[["shadow_bg","Fondo de la sección","color"],["shadow_title_color","Color de títulos","color"],["shadow_text_color","Color del texto","color"],["shadow_card_bg","Fondo del acontecimiento activo","color"],["shadow_art_height","Altura del paisaje (px)","number",180,800],["shadow_overlay","Oscurecimiento del paisaje (%)","number",0,90]],"about":[["about_bg","Fondo de la sección","color"],["about_title_color","Color de títulos","color"],["about_text_color","Color del texto","color"],["about_emblem_size","Ancho máximo del emblema (px)","number",100,600],["about_section_padding","Espaciado interior (px)","number",20,160]],"register":[["register_bg","Fondo de la sección","color"],["register_title_color","Color del título","color"],["register_text_color","Color del texto","color"],["register_form_bg","Fondo del formulario","color"],["register_input_bg","Fondo de los campos","color"],["register_input_text","Texto de los campos","color"],["register_input_border","Borde de los campos","color"],["register_button_bg","Fondo de botones","color"],["register_button_text","Texto de botones","color"],["register_radius","Redondeo de campos y botones (px)","number",0,32]],"navigation":[["header_bg","Fondo del encabezado","color"],["header_height","Altura del encabezado (px)","number",56,150],["header_logo_size","Tamaño del emblema (px)","number",40,160],["nav_text_color","Color de enlaces","color"],["nav_active_color","Color de enlace seleccionado","color"],["nav_register_text_color","Texto del botón Registro","color"],["nav_register_border_color","Borde del botón Registro","color"],["announcement_bg","Fondo de la franja superior","color"],["announcement_bg_text","Texto de la franja superior","color"],["announcement_height","Altura de la franja superior (px)","number",20,70],["footer_bg","Fondo del pie de página","color"],["footer_text_color","Texto del pie de página","color"]],"components":[["button_bg","Fondo de botones generales","color"],["button_text","Texto de botones generales","color"],["button_border","Borde de botones generales","color"],["button_radius","Redondeo de botones (px)","number",0,30],["input_bg","Fondo de campos","color"],["input_text","Texto de campos","color"],["input_border","Borde de campos","color"],["input_radius","Redondeo de campos (px)","number",0,30]]};
function buildDesignControls(){
 Object.entries(DESIGN_CONTROLS).forEach(([group,fields])=>{const host=document.querySelector('[data-design-panel="'+group+'"]');if(!host)return;const wrap=document.createElement('div');wrap.className='customizer-grid';fields.forEach(([key,label,type,a,b])=>{const box=document.createElement('div');box.className='customizer-group design-control-group';const lab=document.createElement('label');lab.textContent=label;let input;if(type==='select'){input=document.createElement('select');a.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);});}else{input=document.createElement('input');input.type=type;if(type==='number'){input.min=a;input.max=b;input.step=1;input.inputMode='numeric';}}input.dataset.setting=key;lab.append(input);box.append(lab);wrap.append(box);});host.append(wrap);});
 document.querySelectorAll('[data-design-tab]').forEach(tab=>tab.addEventListener('click',()=>{const key=tab.dataset.designTab;document.querySelectorAll('[data-design-tab]').forEach(x=>{const active=x===tab;x.classList.toggle('active',active);x.setAttribute('aria-selected',String(active));});document.querySelectorAll('[data-design-panel]').forEach(panel=>{const active=panel.dataset.designPanel===key;panel.classList.toggle('active',active);panel.hidden=!active;});}));
}
buildDesignControls();
const settingFields=[...document.querySelectorAll('#admin-dashboard [data-setting]')];
function buildSettingRichEditors(){
 settingFields.forEach(field=>{
  if(field.dataset.richReady==='true')return;
  const key=field.dataset.setting, original=field;
  const wrapper=document.createElement('div');wrapper.className='setting-rich-field';
  const toolbar=document.createElement('div');toolbar.className='rich-toolbar setting-rich-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Formato de texto');
  const editor=document.createElement('div');editor.className='rich-editor setting-rich-editor';editor.contentEditable='true';editor.dataset.settingKey=key;editor.dataset.richReady='true';editor.dataset.placeholder='Escribe aquí...';editor.setAttribute('role','textbox');editor.setAttribute('aria-multiline','true');
  const makeButton=(label,title,command,value)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;b.setAttribute('aria-label',title);b.dataset.settingCommand=command;if(value)b.dataset.settingValue=value;toolbar.append(b);};
  makeButton('B','Negrita','bold');makeButton('I','Cursiva','italic');makeButton('U','Subrayado','underline');makeButton('S','Tachado','strikeThrough');
  const sep=document.createElement('span');sep.className='rich-toolbar-separator';toolbar.append(sep);
  const size=document.createElement('select');size.className='setting-font-size';size.title='Tamaño de letra';size.setAttribute('aria-label','Tamaño de letra');[['','Tamaño'],['1','Muy pequeño'],['2','Pequeño'],['3','Normal'],['4','Mediano'],['5','Grande'],['6','Muy grande'],['7','Enorme']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;size.append(o);});toolbar.append(size);
  const color=document.createElement('input');color.type='color';color.value='#26384a';color.title='Color del texto';color.setAttribute('aria-label','Color del texto');toolbar.append(color);
  const clean=document.createElement('button');clean.type='button';clean.textContent='Limpiar';clean.title='Quitar formato';clean.dataset.settingCommand='removeFormat';toolbar.append(clean);
  original.hidden=true;original.dataset.settingStorage=key;
  if(key.startsWith('shadow_level_')){
   const saveRow=document.createElement('div');saveRow.className='shadow-field-save-row';
   const saveButton=document.createElement('button');saveButton.type='button';saveButton.className='button button-outline-dark shadow-field-save';saveButton.textContent='Guardar este texto';
   const saveStatus=document.createElement('span');saveStatus.className='shadow-field-save-status';saveStatus.setAttribute('role','status');
   saveButton.addEventListener('click',()=>saveSingleShadowField(original,editor,saveButton,saveStatus));
   saveRow.append(saveButton,saveStatus);wrapper.append(toolbar,editor,saveRow);
  }else wrapper.append(toolbar,editor);
  original.insertAdjacentElement('afterend',wrapper);
  editor.innerHTML=richEditorValue(original.value||'');
  const sync=()=>{original.value=editor.innerHTML;siteSettings[key]=editor.innerHTML;applySiteSettings();};
  editor.addEventListener('input',sync);
  toolbar.querySelectorAll('[data-setting-command]').forEach(btn=>btn.addEventListener('mousedown',e=>e.preventDefault()));
  toolbar.addEventListener('click',e=>{const btn=e.target.closest('[data-setting-command]');if(!btn)return;editor.focus();document.execCommand(btn.dataset.settingCommand,false,btn.dataset.settingValue||null);sync();});
  size.addEventListener('change',()=>{if(!size.value)return;editor.focus();document.execCommand('fontSize',false,size.value);sync();size.value='';});
  color.addEventListener('input',()=>{editor.focus();document.execCommand('foreColor',false,color.value);sync();});
 });
}
buildSettingRichEditors();
async function saveSingleShadowField(field,editor,button,status){
 const key=field.dataset.setting;
 const value=editor.innerText??editor.textContent??'';
 const previous=button.textContent;
 button.disabled=true;button.textContent='Guardando…';status.textContent='';
 try{
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError)throw sessionError;
  if(!session?.user)throw new Error('La sesión administrativa no está activa. Vuelve a iniciar sesión.');
  const {data:current,error:readError}=await db.from('site_settings').select('settings').eq('id',1).single();
  if(readError)throw readError;
  const latest=current?.settings&&typeof current.settings==='object'?current.settings:{};
  const nextSettings={...latest,[key]:value};
  const {error:writeError}=await db.from('site_settings').upsert({id:1,settings:nextSettings,updated_at:new Date().toISOString(),updated_by:session.user.id},{onConflict:'id'});
  if(writeError)throw writeError;
  const {data:check,error:checkError}=await db.from('site_settings').select('settings').eq('id',1).single();
  if(checkError)throw checkError;
  if(check?.settings?.[key]!==value)throw new Error('Supabase no devolvió el mismo texto que se intentó guardar. El cambio no quedó confirmado.');
  siteSettings={...siteSettings,...check.settings};field.value=value;applySiteSettings();
  status.textContent='Guardado y verificado.';
 }catch(error){
  console.error('Error al guardar '+key+':',error);
  status.textContent='No se guardó: '+(error.message||'Error desconocido');
 }finally{button.disabled=false;button.textContent=previous;}
}
function settingImageUrl(path){return path?db.storage.from('smial-media').getPublicUrl(path).data.publicUrl:'';}

function applyDesignOverrides(){
 const s={...SITE_DEFAULTS,...siteSettings};
 const root=document.documentElement;
 const px=(key)=>Number(s[key]||SITE_DEFAULTS[key])+'px';
 const color=(key)=>s[key]||SITE_DEFAULTS[key];
 const rules=[
 ':root{--design-content-width:'+px('global_content_width')+';--design-section-spacing:'+px('global_section_spacing')+';--design-card-radius:'+px('global_radius')+'}',
 '.hero{min-height:'+px('home_height')+';height:min('+px('home_height')+',82vw);--design-hero-overlay:'+((Number(s.home_overlay)||0)/100)+'}',
 '.hero{background-image:linear-gradient(90deg,rgba(8,19,34,var(--design-hero-overlay)),rgba(10,24,40,calc(var(--design-hero-overlay)*.72)) 49%,rgba(8,18,29,.15)),linear-gradient(0deg,rgba(8,18,31,.45),transparent 55%),var(--hero-image, url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=85"))}',
 '.hero h1{font-size:calc('+px('home_title_size')+' * .8)!important;text-shadow:0 3px 12px rgba(0,0,0,.42),0 1px 3px rgba(0,0,0,.55)}.hero-intro{font-size:'+px('home_intro_size')+'!important;max-width:'+px('home_content_width')+'!important}.hero-seal{width:'+px('home_seal_size')+';height:'+px('home_seal_size')+'}',
 '#lore{background:'+color('lore_bg')+';padding-top:'+px('lore_section_padding')+';padding-bottom:'+px('lore_section_padding')+'}#lore #lore-title{color:'+color('lore_title_color')+'}#lore .section-lead,#lore .event-lore-content{color:'+color('lore_text_color')+'}#lore .lore-chapter{background:'+color('lore_card_background')+';border-color:'+color('lore_card_border_color')+';border-radius:'+px('lore_card_radius')+'}#lore .lore-chapter h3{color:'+color('lore_card_title_color')+'}#lore .lore-chapter .event-lore-content{color:'+color('lore_card_text_color')+';font-size:'+px('lore_text_size')+';max-width:'+px('lore_content_width')+'}#lore .lore-date,#lore .lore-inline-date{color:'+color('lore_card_label_color')+'}',
 '#eventos{background:'+color('events_bg')+';padding-top:'+px('events_section_padding')+';padding-bottom:'+px('events_section_padding')+'}#eventos #events-title{color:'+color('events_title_color')+'}#eventos .section-lead,#eventos .public-event{color:'+color('events_text_color')+'}#eventos .public-event{background:'+color('events_card_bg')+';border-radius:'+px('events_card_radius')+'}#eventos .public-event-image{max-height:'+px('events_image_height')+'}',
 '#miembros{background:'+color('members_bg')+'}#miembros #members-title{color:'+color('members_title_color')+'}#miembros .section-lead,#miembros .approved-card{color:'+color('members_text_color')+'}#miembros .approved-card{background:'+color('members_card_bg')+';border-radius:'+px('members_card_radius')+'}#miembros .approved-card>img{width:calc(100% - 36px);height:auto;aspect-ratio:1/1;object-fit:contain;display:block;margin:18px auto 0;background:#101b29}',
 '#la-sombra{background:'+color('shadow_bg')+'}#la-sombra #shadow-title{color:'+color('shadow_title_color')+'}#la-sombra .shadow-intro,#la-sombra .shadow-active-card{color:'+color('shadow_text_color')+'}#la-sombra .shadow-active-card{background:'+color('shadow_card_bg')+'}#la-sombra .shadow-art{min-height:'+px('shadow_art_height')+';filter:brightness('+(1-(Number(s.shadow_overlay)||0)/150)+')}',
 '#nosotros{background:'+color('about_bg')+';padding-top:'+px('about_section_padding')+';padding-bottom:'+px('about_section_padding')+'}#nosotros #about-title{color:'+color('about_title_color')+'}#nosotros .about-copy,#nosotros .about-text{color:'+color('about_text_color')+'}#nosotros .about-emblem{max-width:'+px('about_emblem_size')+'}',
 '#registro{background:'+color('register_bg')+'}#registro #register-title{color:'+color('register_title_color')+'}#registro>p:not(.eyebrow){color:'+color('register_text_color')+'}#registro .member-login-box,#registro form{background:'+color('register_form_bg')+';border-radius:'+px('register_radius')+'}#registro input{background:'+color('register_input_bg')+';color:'+color('register_input_text')+';border-color:'+color('register_input_border')+';border-radius:'+px('register_radius')+'}#registro button{background:'+color('register_button_bg')+';color:'+color('register_button_text')+'}',
 '.announcement{background:'+color('announcement_bg')+';color:'+color('announcement_bg_text')+';height:'+px('announcement_height')+'}.site-header{background:'+color('header_bg')+';height:'+px('header_height')+'}.brand-mark{width:'+px('header_logo_size')+';height:'+px('header_logo_size')+';flex-basis:'+px('header_logo_size')+'}.main-nav>a{color:'+color('nav_text_color')+'}.main-nav>a.active,.main-nav>a:hover{color:'+color('nav_active_color')+'}.main-nav .nav-register{color:'+color('nav_register_text_color')+';border-color:'+color('nav_register_border_color')+'}footer,.site-footer{background:'+color('footer_bg')+';color:'+color('footer_text_color')+'}',
 '.hero .button,#eventos .button,#miembros .button,#la-sombra .button,#nosotros .button,#registro .button{background:'+color('button_bg')+';color:'+color('button_text')+';border-color:'+color('button_border')+';border-radius:'+px('button_radius')+'}#registro input:not([type=checkbox]):not([type=radio]):not([type=file]),#registro textarea,#registro select{background:'+color('input_bg')+';color:'+color('input_text')+';border-color:'+color('input_border')+';border-radius:'+px('input_radius')+'}'
 ];
 let style=document.getElementById('site-design-overrides');if(!style){style=document.createElement('style');style.id='site-design-overrides';document.head.append(style);}style.textContent=rules.join('\n');
}

function applySiteSettings(){
 const s={...SITE_DEFAULTS,...siteSettings};
 const root=document.body;
 const cssFonts={Cinzel:'"Cinzel",Georgia,serif',Georgia:'Georgia,serif',Manrope:'"Manrope",Arial,sans-serif',Arial:'Arial,sans-serif'};
 ['paper','navy','blue','gold'].forEach(k=>root.style.setProperty('--'+k,s[k]||SITE_DEFAULTS[k]));
 root.style.setProperty('--ink',s.text_color||SITE_DEFAULTS.text_color);
 root.style.setProperty('--text-color',s.text_color||SITE_DEFAULTS.text_color);
 root.style.setProperty('--heading-color',s.heading_color||SITE_DEFAULTS.heading_color);
 root.style.setProperty('--announcement-text-color',s.announcement_text_color||SITE_DEFAULTS.announcement_text_color);
 root.style.setProperty('--lore-card-background',s.lore_card_background||SITE_DEFAULTS.lore_card_background);
 root.style.setProperty('--lore-card-title-color',s.lore_card_title_color||SITE_DEFAULTS.lore_card_title_color);
 root.style.setProperty('--lore-card-text-color',s.lore_card_text_color||SITE_DEFAULTS.lore_card_text_color);
 root.style.setProperty('--lore-card-label-color',s.lore_card_label_color||SITE_DEFAULTS.lore_card_label_color);
 root.style.setProperty('--lore-card-border-color',s.lore_card_border_color||SITE_DEFAULTS.lore_card_border_color);
 root.style.setProperty('--nav-text-color',s.nav_text_color||SITE_DEFAULTS.nav_text_color);
 root.style.setProperty('--nav-active-color',s.nav_active_color||SITE_DEFAULTS.nav_active_color);
 root.style.setProperty('--nav-register-text-color',s.nav_register_text_color||SITE_DEFAULTS.nav_register_text_color);
 root.style.setProperty('--nav-register-border-color',s.nav_register_border_color||SITE_DEFAULTS.nav_register_border_color);
 root.style.setProperty('--muted-color',s.muted_color||SITE_DEFAULTS.muted_color);
 root.style.setProperty('--muted',s.muted_color||SITE_DEFAULTS.muted_color);
 root.style.setProperty('--border-color',s.border_color||SITE_DEFAULTS.border_color);
 root.style.setProperty('--silver',s.border_color||SITE_DEFAULTS.border_color);
 root.style.setProperty('--navy2',s.navy||SITE_DEFAULTS.navy);
 root.style.setProperty('--serif',cssFonts[s.serif]||cssFonts.Cinzel);
 root.style.setProperty('--sans',cssFonts[s.sans]||cssFonts.Manrope);
 const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=s.navy||SITE_DEFAULTS.navy;
 
 const text=(id,value)=>{const el=document.getElementById(id);if(el)el.innerHTML=richDisplayValue(value||'');};
 const title=(id,value)=>{const el=document.getElementById(id);if(el)el.innerHTML=richDisplayValue(value||'');};
 text('announcement-copy',s.announcement);text('brand-site-title',s.site_title);text('brand-site-subtitle',s.brand_subtitle);
 text('hero-eyebrow',s.hero_eyebrow);title('hero-title',s.hero_title);text('hero-intro',s.hero_intro);text('hero-caption',s.hero_caption);title('hero-seal-title',s.hero_seal_title);text('hero-seal-subtitle',s.hero_seal_subtitle);
 title('lore-title',s.lore_title);text('lore-intro',s.lore_intro);title('events-title',s.events_title);text('events-intro',s.events_intro);
 title('members-title',s.members_title);text('members-intro',s.members_intro);text('shadow-eyebrow',s.shadow_eyebrow);title('shadow-title',s.shadow_title);text('shadow-intro',s.shadow_intro);text('shadow-chronicle-text',s.shadow_chronicle_text);text('shadow-event-empty',s.shadow_event_empty);title('shadow-rules-title',s.shadow_rules_title);text('shadow-rules-text',s.shadow_rules_text);
 renderSmialLevelNarrative();
 title('about-title',s.about_title);text('about-intro',s.about_intro);text('about-text',s.about_text);
 title('register-title',s.register_title);text('register-intro',s.register_intro);text('footer-text',s.footer_text);
 document.title=(s.site_title||'SMIAL DOL AMROTH')+' | Chile';
 const shadowArt=document.querySelector('#la-sombra .shadow-art');
 if(shadowArt){const shadowBg=s.shadow_background_image_path?settingImageUrl(s.shadow_background_image_path):'';if(shadowBg){shadowArt.style.backgroundImage='url("'+shadowBg.replace(/"/g,'%22')+'")';shadowArt.classList.add('has-custom-background');}else{shadowArt.style.removeProperty('background-image');shadowArt.classList.remove('has-custom-background');}}
 const hero=s.hero_image_path?settingImageUrl(s.hero_image_path):'';
 if(hero)root.style.setProperty('--hero-image','url("'+hero.replace(/"/g,'%22')+'")');else root.style.removeProperty('--hero-image');
 const logo=document.getElementById('brand-logo-image'),mark=document.querySelector('.brand-mark'),svg=mark?.querySelector('svg'),aboutLogo=document.getElementById('about-logo-image'),aboutMark=document.querySelector('.about-emblem'),aboutSvg=aboutMark?.querySelector('svg');
 if(s.logo_image_path){const logoUrl=settingImageUrl(s.logo_image_path);logo.src=logoUrl;logo.hidden=false;mark?.classList.add('has-custom-logo');if(svg)svg.hidden=true;}else{logo.removeAttribute('src');logo.hidden=true;mark?.classList.remove('has-custom-logo');if(svg)svg.hidden=false;}
 if(s.about_logo_image_path){aboutLogo.src=settingImageUrl(s.about_logo_image_path);aboutLogo.hidden=false;aboutMark?.classList.add('has-custom-logo');if(aboutSvg)aboutSvg.hidden=true;}else{aboutLogo.removeAttribute('src');aboutLogo.hidden=true;aboutMark?.classList.remove('has-custom-logo');if(aboutSvg)aboutSvg.hidden=false;}
 applyDesignOverrides();
}
function normalizeShadowNarratives(settings){
 const merged={...SITE_DEFAULTS,...(settings||{})};
 for(let level=1;level<=9;level++){
  for(const kind of ['title','text']){
   const key='shadow_level_'+level+'_'+kind;
   if(typeof merged[key]!=='string'||!merged[key].trim())merged[key]=SITE_DEFAULTS[key]||'';
  }
 }
 return merged;
}
function fillSiteSettingsForm(){
 settingFields.forEach(el=>{const key=el.dataset.setting;const value=siteSettings[key]??SITE_DEFAULTS[key]??'';el.value=value;const editor=el.parentElement.querySelector('.setting-rich-editor');if(editor)editor.innerHTML=richEditorValue(value);});
 [['hero','hero_image_path'],['logo','logo_image_path'],['about-logo','about_logo_image_path'],['shadow-background','shadow_background_image_path']].forEach(([kind,key])=>{const host=document.getElementById('site-'+kind+'-preview'),url=settingImageUrl(siteSettings[key]);if(host)host.innerHTML=url?'<img src="'+escapeHtml(url)+'" alt="Imagen actual">':'Sin imagen personalizada';});
}
async function waitForInitialDesignAssets(){
 const s={...SITE_DEFAULTS,...siteSettings};
 const paths=['hero_image_path','logo_image_path','about_logo_image_path','shadow_background_image_path'];
 const urls=paths.map(key=>s[key]?settingImageUrl(s[key]):'').filter(Boolean);
 const imagePromises=urls.map(url=>new Promise(resolve=>{
  const img=new Image();let finished=false;
  const done=()=>{if(finished)return;finished=true;resolve();};
  img.onload=done;img.onerror=done;img.src=url;
  if(img.complete)done();
 }));
 const fontPromise=document.fonts?.ready?Promise.resolve(document.fonts.ready).catch(()=>{}):Promise.resolve();
 await Promise.race([
  Promise.allSettled([...imagePromises,fontPromise]),
  new Promise(resolve=>setTimeout(resolve,4500))
 ]);
}
async function loadSiteSettings(){
 let timeoutId;
 try{
  const settingsRequest=db.from('site_settings').select('settings').eq('id',1).maybeSingle();
  const result=await Promise.race([
   settingsRequest,
   new Promise(resolve=>{timeoutId=setTimeout(()=>resolve({timeout:true}),8000);})
  ]);
  if(result.timeout){
   console.warn('La configuración visual tardó demasiado. Se mostrará el diseño base.');
  }else if(result.error){
   console.warn('No se pudo cargar el diseño guardado; se usarán los valores base.',result.error);
  }else if(result.data?.settings){
   siteSettings=normalizeShadowNarratives(result.data.settings);
  }
 }catch(error){
  console.warn('No se pudo cargar el diseño guardado; se usarán los valores base.',error);
 }finally{
  if(timeoutId)clearTimeout(timeoutId);
  applySiteSettings();
  await waitForInitialDesignAssets();
  document.documentElement.classList.remove('theme-loading');
 }
}
async function loadSiteSettingsAdmin(){
 const {data,error}=await db.from('site_settings').select('settings').eq('id',1).maybeSingle();
 if(error){say('site-settings-feedback','No se pudo cargar la configuración: '+error.message);return;}
 siteSettings=normalizeShadowNarratives(data?.settings||{});fillSiteSettingsForm();applySiteSettings();await loadSavedSiteDesigns();
}

document.querySelectorAll('[data-site-image]').forEach(input=>input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 const imageLabels={hero_image_path:'imagen de portada',logo_image_path:'emblema del encabezado',about_logo_image_path:'emblema de Quiénes somos',shadow_background_image_path:'fondo de La Sombra'};const label=imageLabels[input.dataset.siteImage]||'imagen';
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

// Guardado independiente de textos: todos persisten en site_settings, desde la pestaña de su sección.
['home','lore','events','members','shadow','about','register'].forEach(section=>{
 const form=document.getElementById('site-'+section+'-form');if(!form)return;
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  form.querySelectorAll('[data-setting]').forEach(field=>{
   const key=field.dataset.setting;
   const editor=field.parentElement.querySelector('.setting-rich-editor');
   if(key&&key.startsWith('shadow_level_')&&editor){
    siteSettings[key]=editor.innerText??editor.textContent??'';
    field.value=siteSettings[key];
   }else if(key&&field.dataset.settingStorage){
    siteSettings[key]=editor?editor.innerHTML:field.value;
   }
  });
  const button=form.querySelector('button[type="submit"]');button.disabled=true;
  try{
   const {data:{session}}=await db.auth.getSession();
   const {error}=await db.from('site_settings').upsert({id:1,settings:siteSettings,updated_at:new Date().toISOString(),updated_by:session?.user?.id||null},{onConflict:'id'});
   if(error)throw error;
   say('site-'+section+'-feedback','Textos guardados correctamente.');applySiteSettings();
  }catch(err){say('site-'+section+'-feedback','No se pudieron guardar los textos: '+(err.message||'Error desconocido'));}
  finally{button.disabled=false;}
 });
});
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
async function loadSavedSiteDesigns(selectedId=''){
 const select=document.getElementById('saved-design-select');if(!select)return;
 select.innerHTML='<option value="">Cargando diseños...</option>';
 const {data,error}=await db.from('saved_site_designs').select('id,name,created_at').order('created_at',{ascending:false});
 if(error){select.innerHTML='<option value="">No se pudieron cargar</option>';say('saved-design-feedback','No se pudieron cargar los diseños: '+error.message);return;}
 select.innerHTML='<option value="">Selecciona un diseño guardado</option>'+(data||[]).map(item=>'<option value="'+escapeHtml(item.id)+'">'+escapeHtml(item.name)+' · '+escapeHtml(new Date(item.created_at).toLocaleDateString('es-CL'))+'</option>').join('');
 if(selectedId)select.value=selectedId;
 if(!(data||[]).length)say('saved-design-feedback','Todavía no hay diseños guardados.');
}
document.getElementById('saved-design-save').addEventListener('click',async()=>{
 const nameInput=document.getElementById('saved-design-name');const name=nameInput.value.trim();const button=document.getElementById('saved-design-save');
 if(!name){say('saved-design-feedback','Escribe un nombre para guardar el diseño.');nameInput.focus();return;}
 button.disabled=true;say('saved-design-feedback','Guardando diseño...');
 try{
  const {data:{session}}=await db.auth.getSession();if(!session)throw new Error('La sesión ha caducado. Inicia sesión nuevamente.');
  const {data,error}=await db.from('saved_site_designs').insert({name,settings:{...siteSettings},created_by:session.user.id}).select('id').single();
  if(error)throw error;
  nameInput.value='';await loadSavedSiteDesigns(data.id);say('saved-design-feedback','Diseño «'+name+'» guardado. No se ha publicado; puedes seguir editándolo.');
 }catch(error){say('saved-design-feedback','No se pudo guardar el diseño: '+(error.message||'Error desconocido'));}
 finally{button.disabled=false;}
});
document.getElementById('saved-design-load').addEventListener('click',async()=>{
 const select=document.getElementById('saved-design-select');const id=select.value;const button=document.getElementById('saved-design-load');
 if(!id){say('saved-design-feedback','Selecciona primero un diseño guardado.');return;}
 button.disabled=true;say('saved-design-feedback','Cargando diseño...');
 try{
  const {data,error}=await db.from('saved_site_designs').select('id,name,settings').eq('id',id).single();
  if(error)throw error;
  if(!data?.settings||typeof data.settings!=='object'||Array.isArray(data.settings))throw new Error('El diseño guardado no contiene una configuración válida.');
  siteSettings={...SITE_DEFAULTS,...data.settings};fillSiteSettingsForm();applySiteSettings();
  say('saved-design-feedback','Diseño «'+data.name+'» cargado en el editor. Para aplicarlo al portal, pulsa «Guardar y publicar diseño».');
 }catch(error){say('saved-design-feedback','No se pudo cargar el diseño: '+(error.message||'Error desconocido'));}
 finally{button.disabled=false;}
});


const charForm=document.getElementById('character-form');
const characterFormPanel=document.getElementById('character-form-panel');
const characterRegisterToggle=document.getElementById('character-register-toggle');
characterRegisterToggle?.addEventListener('click',()=>{
 const opening=characterFormPanel.hidden;
 characterFormPanel.hidden=!opening;
 characterRegisterToggle.setAttribute('aria-expanded',String(opening));
 characterRegisterToggle.innerHTML=opening?'Cerrar formulario <span>×</span>':'Registrar un personaje <span>→</span>';
 if(opening){characterFormPanel.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('character-image')?.focus({preventScroll:true}),350);}
});
const story=document.getElementById('character-story');
story.addEventListener('input',()=>say('story-count',story.value.length+'/1000'));
charForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=charForm.querySelector('button');button.disabled=true;say('character-feedback','Enviando solicitud...');
 try{
  const file=document.getElementById('character-image').files[0];
  if(!file)throw new Error('Selecciona una imagen.');
  const bitmap=await createImageBitmap(file);
  const validDimensions=bitmap.width===1024&&bitmap.height===1024;
  bitmap.close();
  if(!validDimensions)throw new Error('La imagen debe medir exactamente 1024 × 1024 píxeles.');
  const image_path=await uploadImage(file,'characters');
  const {data:{session}}=await db.auth.getSession();const payload={user_id:session?.user?.id||null,real_name:document.getElementById('real-name').value.trim(),tolkien_name:document.getElementById('tolkien-name').value.trim(),role_title:document.getElementById('character-role').value.trim(),story:story.value.trim(),image_path,status:'pending'};
  const {error}=await db.from('characters').insert(payload);if(error)throw error;
  charForm.reset();say('story-count','0/1000');say('character-feedback','Solicitud enviada. Quedará pendiente hasta que un administrador la revise.');characterFormPanel.hidden=true;characterRegisterToggle.setAttribute('aria-expanded','false');characterRegisterToggle.innerHTML='Registrar un personaje <span>→</span>';
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
  return '<article class="approved-card"><img src="'+image+'" alt="Retrato de '+escapeHtml(c.tolkien_name)+'"><div class="approved-card-content"><p class="approved-card-field"><strong>Nombre real:</strong> '+escapeHtml(c.real_name)+'</p><p class="approved-card-field"><strong>Nombre tolkiendil:</strong> '+escapeHtml(c.tolkien_name)+'</p><div class="approved-card-story"><strong>Historia:</strong><p>'+escapeHtml(c.story)+'</p></div><div class="shadow-meter-grid character-levels"><article class="shadow-meter hope-meter"><div class="meter-emblem leaf-emblem" aria-hidden="true"><svg viewBox="0 0 100 100"><path class="leaf-shape" d="M50 7C35 25 15 44 19 63c3 17 17 27 31 30 14-3 28-13 31-30C85 44 65 25 50 7Z"/><path class="leaf-vein" d="M50 91C48 67 49 39 50 12M49 70 29 52M50 57 70 39M49 82 34 68M51 76 68 59"/></svg></div><span>ESPERANZA</span><strong>'+c.hope_level+'/10</strong><div class="meter-track"><i style="width:'+(Number(c.hope_level)*10)+'%"></i></div></article><article class="shadow-meter shadow-meter-dark"><div class="meter-emblem ring-emblem" aria-hidden="true"><svg viewBox="0 0 100 100"><ellipse class="ring-shadow" cx="50" cy="55" rx="31" ry="17"/><ellipse class="ring-band" cx="50" cy="49" rx="31" ry="17"/><path class="ring-highlight" d="M19 49c4-12 58-24 68 0M23 57c10 10 44 13 57 0"/><path class="ring-script" d="m27 42 3-5 2 5 3-7 3 6 4-8 3 6 4-8 3 7 4-6 3 7 4-4 3 7 3-3"/></svg></div><span>SOMBRA</span><strong>'+c.shadow_level+'/10</strong><div class="meter-track shadow-track"><i style="width:'+(Number(c.shadow_level)*10)+'%"></i></div></article></div>'+(c.hope_level<3?'<p class="consumed-label">CONSUMIDO · ANTAGONISTA</p>':'')+(c.achievements?'<p><strong>Logros:</strong> '+escapeHtml(c.achievements)+'</p>':'')+(badges?'<div class="medal-collection"><strong>Medallas de Dol Amroth</strong><div>'+badges+'</div></div>':'')+'</div></article>';
 }).join('')||'<div class="members-empty"><div class="empty-crest">✧</div><h3>Las primeras historias están por llegar</h3><p>Los personajes aparecerán aquí una vez aprobados.</p></div>';
}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function formatLoreDate(value=''){if(!value)return '';const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);if(!match)return '';const date=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]),12));return new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);}
function highlightLoreDates(root){
 if(!root)return;
 // Fechas del Lore: fechas civiles y años de la Tierra Media (p. ej. 3019 T. E.).
 const datePattern=/\b(?:\d{3,4}\s*T\.?\s*E\.?|\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+\d{4})?|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/gi;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
  return node.parentElement?.closest('a, .lore-date, script, style, .lore-inline-date')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  const text=node.nodeValue;datePattern.lastIndex=0;
  if(!datePattern.test(text))return;
  datePattern.lastIndex=0;const fragment=document.createDocumentFragment();let last=0;
  for(const match of text.matchAll(datePattern)){
   fragment.append(document.createTextNode(text.slice(last,match.index)));
   const mark=document.createElement('span');mark.className='lore-inline-date';mark.textContent=match[0];fragment.append(mark);
   last=match.index+match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(last)));node.replaceWith(fragment);
 });
}
async function loadLoreChronicle(){
 const host=document.getElementById('lore-chronicle');if(!host)return;
 const {data,error}=await db.from('lore_chronicle').select('*').order('sort_order',{ascending:true});
 if(error){host.textContent='No fue posible cargar el lore oficial.';return;}
 host.innerHTML=(data||[]).map(entry=>{const cover=entry.cover_image_path?db.storage.from('smial-media').getPublicUrl(entry.cover_image_path).data.publicUrl:'';const date=formatLoreDate(entry.event_date||entry.created_at||entry.updated_at);return '<article class="lore-chapter"><p class="card-kicker">'+(entry.entry_type==='event'?'CRÓNICA RESUELTA':'LORE DEL SMIAL')+'</p>'+(date?'<p class="lore-date">'+escapeHtml(date)+'</p>':'')+'<h3>'+escapeHtml(entry.title)+'</h3>'+(cover?'<img class="lore-chapter-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(entry.content)+'</div></article>';}).join('')||'<p class="small-note">La historia oficial del Smial aún no ha sido publicada.</p>';
 highlightLoreDates(host);
}
async function loadEvents(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').order('event_date',{ascending:true});
 if(error)return;
 host.innerHTML=data.map(ev=>{const cover=ev.lore_cover_image_path?db.storage.from('smial-media').getPublicUrl(ev.lore_cover_image_path).data.publicUrl:'';const eventImage=ev.image_path?db.storage.from('smial-media').getPublicUrl(ev.image_path).data.publicUrl:'';return '<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3>'+'<p>'+sanitizeRich(ev.description||'')+'</p><small>'+escapeHtml(ev.location)+'</small>'+(eventImage?'<img class="public-event-image" src="'+escapeHtml(eventImage)+'" alt="Imagen de '+escapeHtml(ev.title)+'" loading="lazy">':'')+(ev.lore_title?'<div class="event-lore"><span>CRÓNICA DEL SMIAL</span><h4>'+escapeHtml(ev.lore_title)+'</h4>'+(cover?'<img class="event-lore-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(ev.lore_intro||'')+'</div>'+(ev.lore_resolution?'<div class="event-resolution"><b>'+escapeHtml((ev.lore_outcome||'').toUpperCase())+'</b><div class="event-lore-content">'+sanitizeRich(ev.lore_resolution)+'</div></div>':'<small>El desenlace se conocerá al cerrar el evento.</small>')+'</div>':'')+'</article>';}).join('');
 highlightLoreDates(host);
}
async function loadLoreScenarios(){
 const host=document.getElementById('event-placeholder-list');if(!host)return;
 const {data,error}=await db.from('events').select('*').eq('status','published').order('event_date',{ascending:true});
 if(error)return;
 host.innerHTML=data.map(ev=>'<article class="public-event"><p class="card-kicker">'+escapeHtml(ev.event_date)+(ev.event_time?' · '+escapeHtml(ev.event_time.slice(0,5)):'')+'</p><h3>'+escapeHtml(ev.title)+'</h3><p>'+sanitizeRich(ev.description||'')+'</p><small>'+escapeHtml(ev.location)+'</small>'+(ev.lore_title?'<div class="event-lore"><span>CRÓNICA DEL SMIAL</span><h4>'+escapeHtml(ev.lore_title)+'</h4><p>'+escapeHtml(ev.lore_intro||'')+'</p>'+(ev.lore_resolution?'<div class="event-resolution"><b>'+escapeHtml((ev.lore_outcome||'').toUpperCase())+'</b><p>'+escapeHtml(ev.lore_resolution)+'</p></div>':'<small>El desenlace se conocerá al cerrar el evento.</small>')+'</div>':'')+'</article>').join('');
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
 const authBox=document.getElementById('auth-box'),dashboard=document.getElementById('admin-dashboard'),adminNav=document.getElementById('admin-nav-link');
 const isAdmin=!!session&&session.user.app_metadata?.role==='admin';
 if(adminNav)adminNav.hidden=!isAdmin;
 if(!session){authBox.hidden=false;dashboard.hidden=true;return;}
 if(!isAdmin){authBox.hidden=false;dashboard.hidden=true;say('auth-feedback','La sesión está iniciada, pero este correo aún no tiene permisos de administrador. Contacta al responsable del proyecto.');return;}
 authBox.hidden=true;dashboard.hidden=false;say('admin-identity','Sesión: '+session.user.email);
 await Promise.all([loadPending(),loadMembershipRequests(),loadAdminAchievements(),loadAdminEvents(),loadLoreAdmin(),loadMedalAdmin(),loadLoreChronicleAdmin(),loadSiteSettingsAdmin()]);
}

async function loadMembershipRequests(){
 const host=document.getElementById('membership-requests-list');if(!host)return;
 host.textContent='Cargando solicitudes...';
 const {data,error}=await db.functions.invoke('membership-admin',{body:{action:'list'}});
 if(error){host.textContent='No se pudieron cargar las solicitudes: '+(data?.error||error.message);return;}
 const requests=data?.requests||[];
 if(!requests.length){host.innerHTML='<p>No hay solicitudes de ingreso pendientes.</p>';return;}
 host.innerHTML=requests.map(r=>'<article class="admin-item membership-request-item"><div><h4>'+escapeHtml(r.first_name+' '+r.last_name)+'</h4><p>'+escapeHtml(r.email)+'</p><p class="admin-hint">Recibida: '+escapeHtml(new Date(r.submitted_at).toLocaleString('es-CL'))+'</p><button type="button" class="button button-dark" data-membership-review="approved" data-user-id="'+escapeHtml(r.user_id)+'">Aprobar y habilitar cuenta</button> <button type="button" class="button button-outline-dark" data-membership-review="rejected" data-user-id="'+escapeHtml(r.user_id)+'">Rechazar</button></div></article>').join('');
 host.querySelectorAll('[data-membership-review]').forEach(button=>button.addEventListener('click',async()=>{
  const decision=button.dataset.membershipReview;
  const label=decision==='approved'?'aprobar y habilitar esta cuenta':'rechazar esta solicitud';
  if(!confirm('¿Confirmas '+label+'?'))return;
  button.disabled=true;
  const {data,error}=await db.functions.invoke('membership-admin',{body:{action:'review',user_id:button.dataset.userId,status:decision}});
  if(error){alert(data?.error||error.message);button.disabled=false;return;}
  await loadMembershipRequests();
 }));
}
const registerForm=document.getElementById('register-form');
const registerPassword=document.getElementById('register-password');
const registerPasswordConfirm=document.getElementById('register-confirm-password');
const registerPasswordFeedback=document.getElementById('register-password-feedback');
function validateRegisterPasswords(){
 const password=registerPassword.value,confirmation=registerPasswordConfirm.value;
 let message='',valid=false;
 if(password.length>0&&password.length<6)message='La contraseña debe tener al menos 6 caracteres.';
 else if(confirmation.length>0&&password!==confirmation)message='Las contraseñas no coinciden.';
 else if(password.length>=6&&confirmation.length>0&&password===confirmation){message='Las contraseñas coinciden.';valid=true;}
 registerPasswordFeedback.textContent=message;
 registerPasswordFeedback.classList.toggle('is-valid',valid);
 registerPasswordFeedback.classList.toggle('is-invalid',!!message&&!valid);
 registerPassword.setAttribute('aria-invalid',password.length>0&&password.length<6?'true':'false');
 registerPasswordConfirm.setAttribute('aria-invalid',confirmation.length>0&&password!==confirmation?'true':'false');
 return password.length>=6&&password.length<=72&&password===confirmation;
}
[registerPassword,registerPasswordConfirm].forEach(input=>input.addEventListener('input',validateRegisterPasswords));
registerForm.querySelectorAll('[data-password-toggle]').forEach(toggle=>toggle.addEventListener('click',()=>{
 const input=document.getElementById(toggle.dataset.passwordToggle);
 const show=input.type==='password';
 input.type=show?'text':'password';
 toggle.setAttribute('aria-pressed',String(show));
 toggle.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');
 toggle.title=show?'Ocultar contraseña':'Mostrar contraseña';
}));
registerForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const button=registerForm.querySelector('button[type="submit"]');
 const password=registerPassword.value;
 const confirmation=registerPasswordConfirm.value;
 if(!validateRegisterPasswords()){
  say('form-feedback',password.length<6?'La contraseña debe tener al menos 6 caracteres.':'Las contraseñas no coinciden.');
  (password.length<6?registerPassword:registerPasswordConfirm).focus();return;
 }
 button.disabled=true;say('form-feedback','Enviando solicitud...');
 try{
  const {data,error}=await db.functions.invoke('membership-request',{body:{
   first_name:document.getElementById('register-first-name').value.trim(),
   last_name:document.getElementById('register-last-name').value.trim(),
   email:document.getElementById('register-email').value.trim(),
   password,confirm_password:confirmation
  }});
  if(error)throw new Error(data?.error||error.message||'No se pudo enviar la solicitud.');
  registerForm.reset();
  say('form-feedback','Solicitud enviada correctamente. La administración revisará tus datos y, si la aprueba, tu cuenta quedará habilitada para ingresar.');
 }catch(err){say('form-feedback',err.message||'No se pudo enviar la solicitud.');}
 finally{button.disabled=false;}
});
const memberLoginForm=document.getElementById('member-login-form');
memberLoginForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=memberLoginForm.querySelector('button[type="submit"]');button.disabled=true;
 const {data,error}=await db.auth.signInWithPassword({email:document.getElementById('member-login-email').value.trim(),password:document.getElementById('member-login-password').value});
 if(error)say('member-login-feedback','No fue posible ingresar. Comprueba tus datos y que tu solicitud haya sido aprobada.');
 else{say('member-login-feedback','Sesión iniciada correctamente.');say('member-session-state','Sesión activa: '+(data.user?.user_metadata?.first_name||data.user?.email||''));document.getElementById('member-logout-button').hidden=false;memberLoginForm.hidden=true;}
 button.disabled=false;
});
document.getElementById('member-logout-button').addEventListener('click',async()=>{
 await db.auth.signOut();memberLoginForm.hidden=false;memberLoginForm.reset();document.getElementById('member-logout-button').hidden=true;say('member-session-state','');say('member-login-feedback','Sesión cerrada.');
});
async function refreshMemberLogin(){
 const {data:{session}}=await db.auth.getSession();
 const form=document.getElementById('member-login-form'),logout=document.getElementById('member-logout-button');
 if(session && session.user.app_metadata?.role!=='admin'){
  form.hidden=true;logout.hidden=false;say('member-session-state','Sesión activa: '+(session.user.user_metadata?.first_name||session.user.email));
 }else if(!session){form.hidden=false;logout.hidden=true;say('member-session-state','');}
}

loginForm.addEventListener('submit',async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:document.getElementById('admin-email').value.trim(),password:document.getElementById('admin-password').value});say('auth-feedback',error?error.message:'Sesión iniciada.');if(!error)await refreshAdmin();});
document.getElementById('signup-button').addEventListener('click',async()=>{
 const email=document.getElementById('admin-email').value.trim(),password=document.getElementById('admin-password').value;
 if(email.toLowerCase()!=='ch.munozfu@gmail.com'){say('auth-feedback','La creación inicial está limitada al correo administrador indicado.');return;}
 if(password.length<8){say('auth-feedback','Usa una contraseña de al menos 8 caracteres.');return;}
 const {error}=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname+'#admin'}});
 say('auth-feedback',error?error.message:'Cuenta creada. Revisa tu correo para confirmar la dirección y luego inicia sesión. El administrador debe recibir el rol admin antes de usar el panel.');
});
db.auth.onAuthStateChange(()=>{setTimeout(()=>{refreshAdmin();refreshMemberLogin();},0);});
document.getElementById('logout-button').addEventListener('click',async()=>{await db.auth.signOut();await refreshAdmin();});
async function loadPending(){
 const host=document.getElementById('pending-characters');const {data,error}=await db.from('characters').select('*').eq('status','pending').order('submitted_at');
 if(error){host.textContent='Error cargando solicitudes: '+error.message;return;}
 const notice=document.getElementById('character-pending-notice');
 if(notice){
  const count=(data||[]).length;
  notice.hidden=count===0;
  notice.innerHTML=count?'<strong>Hay '+count+' solicitud'+(count===1?'':'es')+' de personaje pendiente'+(count===1?'':'s')+' de revisión.</strong> <button type="button" class="button button-dark" id="open-pending-characters">Revisar ahora</button>':'';
  document.getElementById('open-pending-characters')?.addEventListener('click',()=>document.querySelector('[data-admin-tab="admin-tab-members"]')?.click());
 }
 const membersTab=document.querySelector('[data-admin-tab="admin-tab-members"]');
 if(membersTab){
  const baseLabel='Miembros';
  membersTab.textContent=baseLabel+(data?.length?' · '+data.length:'');
  membersTab.setAttribute('aria-label',baseLabel+(data?.length?', '+data.length+' solicitudes pendientes':''));
 }
 host.innerHTML=data.map(c=>{const image=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;return '<article class="admin-item"><img src="'+image+'" alt=""><div><h4>'+escapeHtml(c.tolkien_name)+' — '+escapeHtml(c.real_name)+'</h4><p><b>'+escapeHtml(c.role_title)+'</b></p><p>'+escapeHtml(c.story)+'</p><p class="admin-hint">Los logros se asignan desde el panel de personajes aprobados.</p><button data-review="approved" data-id="'+c.id+'" class="button button-dark">Aprobar</button> <button data-review="rejected" data-id="'+c.id+'" class="button button-outline-dark">Rechazar</button></div></article>';}).join('')||'<p>No hay solicitudes pendientes.</p>';
 host.querySelectorAll('[data-review]').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;const {error}=await db.from('characters').update({status:button.dataset.review,reviewed_at:new Date().toISOString()}).eq('id',button.dataset.id);if(error)alert(error.message);await loadPending();await loadApproved();await loadAdminAchievements();}));
}

async function loadAdminAchievements(){
 const host=document.getElementById('admin-character-achievements');if(!host)return;
 const {data,error}=await db.from('characters').select('id,real_name,tolkien_name,role_title,story,achievements,image_path,hope_level,shadow_level').eq('status','approved').order('tolkien_name');
 if(error){host.textContent='No se pudieron cargar los personajes: '+error.message;return;}
 host.innerHTML=(data||[]).map(c=>{
  const imageUrl=db.storage.from('smial-media').getPublicUrl(c.image_path).data.publicUrl;
  return '<article class="admin-achievement-row admin-character-editor" data-character-editor="'+c.id+'">'+
   '<div class="admin-achievement-heading"><strong>'+escapeHtml(c.tolkien_name)+'</strong><small>'+escapeHtml(c.real_name)+' · '+escapeHtml(c.role_title)+'</small><small>Esperanza '+c.hope_level+'/10 · Sombra '+c.shadow_level+'/10</small></div>'+
   '<div class="admin-character-current-image"><img src="'+escapeHtml(imageUrl)+'" alt="Imagen actual de '+escapeHtml(c.tolkien_name)+'"></div>'+
   '<label>Reemplazar imagen del personaje (opcional; cuadrada, 1024 × 1024 px)<input type="file" accept="image/jpeg,image/png,image/webp" data-character-image="'+c.id+'"></label>'+
   '<label>Nombre real<input type="text" maxlength="120" value="'+escapeHtml(c.real_name||'')+'" data-character-field="real_name"></label>'+
   '<label>Nombre tolkiendil<input type="text" maxlength="120" value="'+escapeHtml(c.tolkien_name||'')+'" data-character-field="tolkien_name"></label>'+
   '<label>Cargo<input type="text" maxlength="120" value="'+escapeHtml(c.role_title||'')+'" data-character-field="role_title"></label>'+
   '<label>Historia<textarea rows="5" maxlength="1000" data-character-field="story">'+escapeHtml(c.story||'')+'</textarea></label>'+
   '<button class="button button-dark" type="button" data-save-character="'+c.id+'">Guardar cambios del personaje</button><p class="form-feedback" data-character-feedback role="status"></p>'+
   '<label class="admin-character-achievement-label">Logros reconocidos por la administración<textarea rows="3" maxlength="2000" data-character-achievements>'+escapeHtml(c.achievements||'')+'</textarea></label>'+
   '<button class="button button-outline-dark" type="button" data-save-achievements="'+c.id+'">Guardar logros</button></article>';
 }).join('')||'<p>Aún no hay personajes aprobados.</p>';
 host.querySelectorAll('[data-save-character]').forEach(button=>button.addEventListener('click',async()=>{
  const card=button.closest('[data-character-editor]'),id=button.dataset.saveCharacter;
  const field=name=>card.querySelector('[data-character-field="'+name+'"]').value.trim();
  const feedback=card.querySelector('[data-character-feedback]'),file=card.querySelector('[data-character-image]').files[0];
  const payload={real_name:field('real_name'),tolkien_name:field('tolkien_name'),role_title:field('role_title'),story:field('story')};
  if(!payload.real_name||!payload.tolkien_name||!payload.role_title||!payload.story){feedback.textContent='Completa todos los campos antes de guardar.';return;}
  if(payload.story.length>1000){feedback.textContent='La historia no puede superar los 1000 caracteres.';return;}
  button.disabled=true;feedback.textContent='Guardando cambios...';
  try{
   if(file){
    const bitmap=await createImageBitmap(file);
    const validDimensions=bitmap.width===1024&&bitmap.height===1024;bitmap.close();
    if(!validDimensions)throw new Error('La imagen debe medir exactamente 1024 × 1024 píxeles.');
    payload.image_path=await uploadImage(file,'characters');
   }
   const {error}=await db.from('characters').update(payload).eq('id',id).eq('status','approved');
   if(error)throw error;
   feedback.textContent='Personaje actualizado correctamente.';
   await loadApproved();
   await loadAdminAchievements();
  }catch(err){feedback.textContent=err.message||'No se pudieron guardar los cambios.';button.disabled=false;}
 }));
 host.querySelectorAll('[data-save-achievements]').forEach(button=>button.addEventListener('click',async()=>{
  const card=button.closest('[data-character-editor]'),id=button.dataset.saveAchievements,field=card.querySelector('[data-character-achievements]');
  button.disabled=true;const {error}=await db.from('characters').update({achievements:field.value.trim()}).eq('id',id).eq('status','approved');
  if(error)alert('No se pudieron guardar los logros: '+error.message);
  else{button.textContent='Logros guardados';await loadApproved();}
  button.disabled=false;
 }));
}
let editingEventId=null;
const eventForm=document.getElementById('event-form');
const eventSubmitButton=eventForm.querySelector('button[type="submit"]');
const eventCancelButton=document.getElementById('event-edit-cancel');
function resetEventEditor(){
 editingEventId=null;eventForm.reset();document.getElementById('event-description-editor').innerHTML='';
 eventSubmitButton.textContent='Publicar evento';eventCancelButton.hidden=true;
 say('event-feedback','');
}
eventCancelButton.addEventListener('click',resetEventEditor);
async function startEditEvent(eventId){
 const {data:ev,error}=await db.from('events').select('*').eq('id',eventId).single();
 if(error||!ev){say('event-feedback',error?.message||'No se pudo cargar el evento.');return;}
 if(!ev.lore_scenario_id){say('event-feedback','Este evento no tiene un acontecimiento asociado y no se puede editar desde este formulario.');return;}
 const {data:scenario,error:scenarioError}=await db.from('lore_scenarios').select('*').eq('id',ev.lore_scenario_id).maybeSingle();
 if(scenarioError||!scenario){say('event-feedback','No se encontró el acontecimiento asociado a este evento.');return;}
 const select=document.getElementById('event-lore-scenario');
 if(!Array.from(select.options).some(option=>option.value===scenario.id)){
  select.add(new Option(scenario.name,scenario.id));
 }
 editingEventId=ev.id;
 document.getElementById('event-title').value=ev.title||'';
 select.value=scenario.id;
 document.getElementById('event-description-editor').innerHTML=ev.description||'';
 document.getElementById('event-date').value=ev.event_date||'';
 document.getElementById('event-time').value=(ev.event_time||'').slice(0,5);
 document.getElementById('event-location').value=ev.location||'';
 document.getElementById('event-image').value='';
 eventSubmitButton.textContent='Guardar cambios';
 eventCancelButton.hidden=false;
 say('event-feedback','Editando: '+ev.title+'. Si no seleccionas una imagen nueva, se conservará la actual.');
 eventForm.scrollIntoView({behavior:'smooth',block:'center'});
}
eventForm.addEventListener('submit',async e=>{
 e.preventDefault();const button=eventSubmitButton;button.disabled=true;
 say('event-feedback',editingEventId?'Guardando cambios del evento...':'Preparando evento y crónica...');
 try{
  if(!editingEventId){
   const {data:pending}=await db.from('events').select('id').eq('status','published').eq('attendance_closed',false).not('lore_scenario_id','is',null).limit(1);
   if(pending?.length)throw new Error('Ya existe un acontecimiento activo en La Sombra. Resuélvelo antes de publicar otro.');
  }
  const selectedId=document.getElementById('event-lore-scenario').value;
  if(!selectedId)throw new Error('Selecciona el acontecimiento que vas a activar.');
  const eventDescription=document.getElementById('event-description-editor');
  if(!eventDescription.textContent.trim())throw new Error('Escribe la descripción del evento.');
  const {data:scenario,error:scenarioError}=await db.from('lore_scenarios').select('*').eq('id',selectedId).maybeSingle();
  if(scenarioError)throw scenarioError;
  if(!scenario||(!editingEventId&&!scenario.active))throw new Error('No se pudo seleccionar una historia activa.');
  const file=document.getElementById('event-image').files[0];
  let image_path=null;
  if(file)image_path=await uploadImage(file,'events');
  const payload={title:document.getElementById('event-title').value.trim(),description:sanitizeRich(eventDescription.innerHTML),event_date:document.getElementById('event-date').value,event_time:document.getElementById('event-time').value||null,location:document.getElementById('event-location').value.trim(),lore_scenario_id:scenario.id,lore_title:scenario.name,lore_cover_image_path:scenario.cover_image_path||null,lore_intro:scenario.intro,lore_low_resolution:scenario.low_resolution,lore_partial_resolution:scenario.partial_resolution,lore_success_resolution:scenario.success_resolution,lore_partial_threshold:scenario.partial_threshold,lore_success_threshold:scenario.success_threshold};
  if(file)payload.image_path=image_path;
  if(editingEventId){
   const {error}=await db.from('events').update(payload).eq('id',editingEventId);
   if(error)throw error;
   const updatedTitle=payload.title;resetEventEditor();say('event-feedback','Evento actualizado: '+updatedTitle+'.');
  }else{
   payload.image_path=image_path;payload.status='published';
   const {error}=await db.from('events').insert(payload);if(error)throw error;
   resetEventEditor();say('event-feedback','Evento publicado con la crónica: '+scenario.name+'.');
  }
  await Promise.all([loadAdminEvents(),loadEvents()]);
 }catch(err){say('event-feedback',err.message||'No se pudo guardar el evento.');}finally{button.disabled=false;}
});
async function loadAdminEvents(){
 const host=document.getElementById('admin-events');const {data,error}=await db.from('events').select('*').order('event_date',{ascending:false});
 if(error){host.textContent=error.message;return;}
 host.innerHTML=data.map(ev=>'<article class="admin-event"><div><strong>'+escapeHtml(ev.title)+'</strong><small>'+escapeHtml(ev.event_date)+' · '+escapeHtml(ev.location)+' · '+escapeHtml(ev.status)+(ev.attendance_closed?' · asistencia cerrada':'')+(ev.lore_outcome?' · crónica: '+escapeHtml(ev.lore_outcome):'')+'</small>'+(ev.lore_title?'<small>Historia: '+escapeHtml(ev.lore_title)+(ev.lore_score!==null?' · puntuación '+ev.lore_score:'')+'</small>':'')+'</div><div class="admin-event-actions"><button class="button button-outline-dark" data-edit-event="'+ev.id+'">Editar evento</button>'+(ev.status==='published'&&!ev.attendance_closed?'<button class="button button-outline-dark" data-attendance-event="'+ev.id+'">Asistencia y medallas</button>':'')+'<button class="button button-outline-dark" data-delete-event="'+ev.id+'">Eliminar</button></div></article>').join('')||'<p>No hay eventos.</p>';
 host.querySelectorAll('[data-edit-event]').forEach(button=>button.addEventListener('click',()=>startEditEvent(button.dataset.editEvent)));
 host.querySelectorAll('[data-attendance-event]').forEach(button=>button.addEventListener('click',()=>openAttendance(button.dataset.attendanceEvent)));
 host.querySelectorAll('[data-delete-event]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('¿Eliminar este evento?'))return;const {error}=await db.from('events').delete().eq('id',button.dataset.deleteEvent);if(error)alert(error.message);await loadAdminEvents();await loadEvents();}));
}
async function openAttendance(eventId){
 const host=document.getElementById('attendance-manager');host.textContent='Cargando los 16 miembros...';
 const [{data:members,error:me},{data:existing,error:ae},{data:eventRow}]=await Promise.all([
  db.from('smial_members').select('id,member_name,hope_level,shadow_level,user_id').order('member_name'),
  db.from('smial_member_attendance').select('member_id,attended').eq('event_id',eventId),
  db.from('events').select('title,attendance_closed,lore_title').eq('id',eventId).single()
 ]);
 if(me||ae||!eventRow){host.textContent=(me||ae)?.message||'No se pudo cargar el evento.';return;}
 if(eventRow.attendance_closed){host.textContent='La asistencia ya fue cerrada.';return;}
 if(members.length!==16){host.textContent='Error: se esperaban 16 miembros y se encontraron '+members.length+'.';return;}
 const present=new Set((existing||[]).filter(x=>x.attended).map(x=>x.member_id));
 host.innerHTML='<h4>'+escapeHtml(eventRow.title)+'</h4><p>Registra a los 16 miembros, tengan o no personaje. Los ausentes pierden 1 Esperanza; cada medalla suma 1 adicional.</p><form id="attendance-form"><div class="attendance-list">'+members.map(m=>'<label><input type="checkbox" name="attended" value="'+m.id+'" '+(present.has(m.id)?'checked':'')+'><span><strong>'+escapeHtml(m.member_name)+'</strong><small>Esperanza '+m.hope_level+'/9 · Sombra '+m.shadow_level+'/9'+(m.hope_level<3?' · CONSUMIDO':'')+(m.user_id?' · CUENTA VINCULADA':' · CUENTA PROVISIONAL')+'</small></span></label>').join('')+'</div><button class="button button-dark" type="submit">Guardar asistencia</button> <button class="button button-outline-dark" id="close-attendance" type="button">Cerrar evento y resolver crónica</button><p id="attendance-feedback" class="form-feedback"></p></form><div id="event-medal-manager" class="event-medal-manager"><h4>Medallas de Dol Amroth</h4><p>Cada medalla suma 1 punto de Esperanza y 1 punto a la resolución narrativa.</p><div id="event-medal-awards"></div><form id="event-medal-form" class="medal-award-form"><label for="medal-member">Miembro</label><select id="medal-member" required>'+members.map(m=>'<option value="'+m.id+'">'+escapeHtml(m.member_name)+'</option>').join('')+'</select><label for="medal-type">Medalla</label><select id="medal-type" required></select><label for="medal-reason">Motivo</label><input id="medal-reason" maxlength="300" required><button class="button button-dark" type="submit">Otorgar medalla</button><p id="medal-feedback" class="form-feedback"></p></form></div>';
 const form=document.getElementById('attendance-form');
 const save=()=>{const ids=[...form.querySelectorAll('input[name="attended"]:checked')].map(x=>x.value);return db.from('smial_member_attendance').upsert(members.map(m=>({event_id:eventId,member_id:m.id,attended:ids.includes(m.id)})),{onConflict:'event_id,member_id'});};
 form.addEventListener('submit',async e=>{e.preventDefault();const {error}=await save();say('attendance-feedback',error?'Error: '+error.message:'Asistencia de los 16 miembros guardada.');});
 document.getElementById('close-attendance').addEventListener('click',async()=>{
  if(!confirm('Se aplicarán los cambios de Esperanza a los 16 miembros y se recalculará el promedio global. El cierre no se puede deshacer. ¿Continuar?'))return;
  const {error:se}=await save();if(se){say('attendance-feedback',se.message);return;}
  const {error:ce}=await db.from('events').update({attendance_closed:true}).eq('id',eventId);if(ce){say('attendance-feedback',ce.message);return;}
  const {data:ev}=await db.from('events').select('lore_outcome,lore_resolution,lore_score').eq('id',eventId).single();
  host.innerHTML='<h4>Acontecimiento resuelto</h4><p>Se actualizaron los 16 registros y el promedio global.</p>'+(ev?.lore_resolution?'<div class="event-resolution admin-resolution"><b>'+(ev.lore_outcome==='esperanza'?'VICTORIA DE LA ESPERANZA':'VICTORIA DE LA SOMBRA')+' · '+ev.lore_score+' PUNTOS</b><div class="event-lore-content">'+sanitizeRich(ev.lore_resolution)+'</div></div>':'<p>No había desenlace narrativo asociado.</p>');
  await Promise.all([loadAdminEvents(),loadApproved(),loadShadowState(),loadEvents(),loadLoreChronicle()]);
 });
 await loadEventMedalManager(eventId,members);
}
async function loadEventMedalManager(eventId,members){
 const [{data:catalog,error:ce},{data:awards,error:ae}]=await Promise.all([
  db.from('medal_catalog').select('id,name,description,icon,active').order('sort_order'),
  db.from('smial_member_medals').select('id,member_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at')
 ]);
 const type=document.getElementById('medal-type'),list=document.getElementById('event-medal-awards');if(ce||ae){list.textContent=(ce||ae).message;return;}
 type.innerHTML=(catalog||[]).filter(m=>m.active).map(m=>'<option value="'+m.id+'">'+escapeHtml(m.icon)+' '+escapeHtml(m.name)+' — '+escapeHtml(m.description)+'</option>').join('');
 const names=new Map(members.map(m=>[m.id,m.member_name])),medals=new Map((catalog||[]).map(m=>[m.id,m]));
 const render=()=>{list.innerHTML=awards.length?'<p class="medal-award-count">Medallas otorgadas: '+awards.length+'</p>'+awards.map(x=>'<div class="medal-award-row"><span><b>'+escapeHtml(medals.get(x.medal_id)?.icon||'✦')+' '+escapeHtml(medals.get(x.medal_id)?.name||'Medalla')+'</b> · '+escapeHtml(names.get(x.member_id)||'Miembro')+'<small>'+escapeHtml(x.reason)+'</small></span><button type="button" class="button button-outline-dark" data-remove-member-medal="'+x.id+'">Retirar</button></div>').join(''):'<p>Todavía no se han otorgado medallas.</p>';
 list.querySelectorAll('[data-remove-member-medal]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('¿Retirar esta medalla?'))return;const {error}=await db.from('smial_member_medals').delete().eq('id',btn.dataset.removeMemberMedal);if(error){say('medal-feedback',error.message);return;}const q=await db.from('smial_member_medals').select('id,member_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at');awards.splice(0,awards.length,...(q.data||[]));render();}));};
 render();
 document.getElementById('event-medal-form').addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('button');btn.disabled=true;const {data:{session}}=await db.auth.getSession();const {error}=await db.from('smial_member_medals').insert({member_id:document.getElementById('medal-member').value,medal_id:type.value,event_id:eventId,reason:document.getElementById('medal-reason').value.trim(),awarded_by:session?.user?.id||null});if(error)say('medal-feedback',error.message);else{say('medal-feedback','Medalla otorgada.');document.getElementById('medal-reason').value='';const q=await db.from('smial_member_medals').select('id,member_id,medal_id,reason,awarded_at').eq('event_id',eventId).order('awarded_at');awards.splice(0,awards.length,...(q.data||[]));render();}btn.disabled=false;});
}

function sanitizeRich(value=''){
 const config={ALLOWED_TAGS:['p','div','br','strong','b','em','i','u','h2','h3','h4','ul','ol','li','blockquote','img','a','font'],ALLOWED_ATTR:['href','src','alt','title','target','rel','color','size'],ALLOW_DATA_ATTR:false};
 if(window.DOMPurify)return window.DOMPurify.sanitize(String(value),config);
 return escapeHtml(value).replace(/\n/g,'<br>');
}
function richEditorValue(value=''){
 const text=String(value||'');
 return /<\/?[a-z][\s\S]*>/i.test(text)?sanitizeRich(text):text?'<p>'+escapeHtml(text).replace(/\n/g,'<br>')+'</p>':'';
}
function richDisplayValue(value=''){const text=String(value||'');return /<\/?[a-z][\s\S]*>/i.test(text)?sanitizeRich(text):escapeHtml(text).replace(/\n/g,'<br>');}
function initRichEditors(){
 document.querySelectorAll('.rich-toolbar').forEach(toolbar=>{
  if(toolbar.dataset.extended==='true')return;toolbar.dataset.extended='true';
  const target=toolbar.querySelector('[data-editor-target]')?.dataset.editorTarget;if(!target)return;
  const sep=document.createElement('span');sep.className='rich-toolbar-separator';toolbar.append(sep);
  const size=document.createElement('select');size.className='setting-font-size';size.title='Tamaño de letra';size.setAttribute('aria-label','Tamaño de letra');
  [['','Tamaño'],['1','Muy pequeño'],['2','Pequeño'],['3','Normal'],['4','Mediano'],['5','Grande'],['6','Muy grande'],['7','Enorme']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;size.append(o);});toolbar.append(size);
  const color=document.createElement('input');color.type='color';color.value='#26384a';color.title='Color del texto';color.setAttribute('aria-label','Color del texto');toolbar.append(color);
  size.addEventListener('change',()=>{if(!size.value)return;const editor=document.getElementById(target);editor?.focus();document.execCommand('fontSize',false,size.value);editor?.dispatchEvent(new Event('input',{bubbles:true}));size.value='';});
  color.addEventListener('input',()=>{const editor=document.getElementById(target);editor?.focus();document.execCommand('foreColor',false,color.value);editor?.dispatchEvent(new Event('input',{bubbles:true}));});
 });
 document.querySelectorAll('[data-editor-command]').forEach(button=>{
  button.addEventListener('mousedown',e=>e.preventDefault());
  button.addEventListener('click',()=>{
   const editor=document.getElementById(button.dataset.editorTarget);if(!editor)return;
   editor.focus();const command=button.dataset.editorCommand;
   const value=button.dataset.editorValue;
   let argument=value?(command==='formatBlock'?'<'+value+'>':value):null;
   if(command==='createLink'){argument=prompt('Introduce la dirección del enlace (https://...)');if(!argument)return;if(!(argument.startsWith('https://')||argument.startsWith('http://'))){alert('El enlace debe comenzar con https:// o http://');return;}}
   document.execCommand(command,false,argument);
   editor.dispatchEvent(new Event('input',{bubbles:true}));
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
async function loadActiveShadowEvent(){const host=document.getElementById('shadow-active-event');if(!host)return;const {data,error}=await db.from('events').select('id,title,description,event_date,event_time,location,lore_title,lore_intro,lore_cover_image_path').eq('status','published').eq('attendance_closed',false).not('lore_scenario_id','is',null).order('event_date',{ascending:true});if(error){host.textContent='No fue posible cargar el acontecimiento activo.';return;}const dataToShow=(data||[]).find(event=>!['el faro apagado'].includes(String(event.lore_title||'').trim().toLocaleLowerCase('es'))&&!['el faro apagado'].includes(String(event.title||'').trim().toLocaleLowerCase('es')));if(!dataToShow){host.innerHTML='';return;}const cover=dataToShow.lore_cover_image_path?db.storage.from('smial-media').getPublicUrl(dataToShow.lore_cover_image_path).data.publicUrl:'';host.innerHTML='<article class="shadow-active-card"><p class="card-kicker">ACONTECIMIENTO ACTIVO</p><h3>'+escapeHtml(dataToShow.lore_title||dataToShow.title)+'</h3><p>'+escapeHtml(dataToShow.description)+'</p>'+(cover?'<img class="event-lore-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(dataToShow.lore_intro||'')+'</div><small>'+escapeHtml(dataToShow.event_date)+(dataToShow.event_time?' · '+escapeHtml(dataToShow.event_time.slice(0,5)):'')+' · '+escapeHtml(dataToShow.location)+'</small><p class="shadow-pending">PENDIENTE DE RESOLUCIÓN</p></article>';}
const SMIAL_LEVEL_NARRATIVES={
  1:{title:'SOMBRA 9 — EL DOMINIO DE LA SOMBRA',text:'La Sombra ha alcanzado su máxima influencia sobre el principado. El miedo y la desesperación consumen la voluntad de sus habitantes, la ambición y la crueldad prevalecen sobre la compasión y los antiguos vínculos parecen haber perdido su significado. La esperanza apenas encuentra refugio en algunos corazones y la voluntad de resistir se encuentra profundamente debilitada. Las tierras pueden conservar sus murallas y sus estandartes, pero su espíritu parece sometido a la oscuridad.'},
  2:{title:'SOMBRA 8 — LA VOLUNTAD QUEBRANTADA',text:'La oscuridad ha penetrado profundamente en la vida del principado. El temor gobierna muchas decisiones, la codicia enfrenta a quienes antes compartían un mismo propósito y la desesperanza debilita incluso a los más decididos. Los actos de crueldad se vuelven menos sorprendentes y la confianza entre los habitantes resulta cada vez más difícil de encontrar. La Sombra no necesita conquistar todas las fortalezas cuando puede dominar las voluntades de quienes las habitan.'},
  3:{title:'SOMBRA 7 — EL PESO DE LA OSCURIDAD',text:'La influencia de la Sombra se hace cada vez más evidente. El miedo debilita la voluntad de los habitantes, la desconfianza separa a las comunidades y los intereses personales comienzan a prevalecer sobre el bien común. La crueldad y la ambición encuentran terreno fértil, mientras los actos de bondad parecen perder importancia. Las tierras conservan su apariencia, pero el espíritu de sus gentes comienza a cambiar.'},
  4:{title:'SOMBRA 6 — SUSURROS EN LA DISTANCIA',text:'Una inquietud difícil de explicar comienza a sentirse en las tierras del principado. La desconfianza se abre paso entre sus habitantes, los rumores alimentan los temores y la codicia comienza a imponerse sobre la generosidad. Algunos olvidan sus deberes y otros prefieren mirar hacia otro lado ante las dificultades ajenas. La influencia de la Sombra todavía es discreta, pero ya encuentra lugar en los corazones de quienes habitan estas tierras.'},
  5:{title:'ESPERANZA Y SOMBRA — EN EQUILIBRIO',text:'La influencia de la Sombra y la voluntad de resistir se encuentran en equilibrio. En las tierras del principado conviven la desconfianza y la lealtad, el temor y el valor, la ambición y la generosidad. Ninguna de estas fuerzas prevalece por completo. El destino de Dol Amroth permanece abierto y depende de las decisiones y acciones de sus habitantes.'},
  6:{title:'ESPERANZA 6 — LA LLAMA QUE PERMANECE',text:'Incluso en tiempos difíciles, la Sombra no ha conseguido apagar toda esperanza. Todavía existen habitantes que conservan su palabra, protegen a los débiles y se niegan a abandonar sus principios. La amistad y la lealtad permanecen como pequeñas luces frente a la oscuridad. No siempre es fácil distinguir el camino correcto, pero aún hay quienes encuentran fuerzas para resistir la desesperanza y recordar aquello que merece ser defendido.'},
  7:{title:'ESPERANZA 7 — LA FORTALEZA DE LOS CORAZONES',text:'La voluntad de los habitantes comienza a imponerse sobre la influencia de la Sombra. La lealtad recupera su valor, la generosidad encuentra espacio y las comunidades vuelven a reconocer la importancia de permanecer unidas. El miedo no ha desaparecido, pero ya no determina todas las decisiones. Quienes conservan sus principios encuentran fuerzas para ayudar a otros y enfrentar las tentaciones de la oscuridad.'},
  8:{title:'ESPERANZA 8 — LA LUZ DE LA RESISTENCIA',text:'El espíritu del principado se encuentra fortalecido. La confianza, la amistad y el sentido del deber prevalecen sobre la codicia y la desconfianza. Sus habitantes demuestran una voluntad firme frente a las dificultades y no permiten que el temor determine su destino. La Sombra todavía existe y sus tentaciones no han desaparecido, pero encuentra una resistencia cada vez mayor en quienes recuerdan el valor de la compasión, la lealtad y el sacrificio.'},
  9:{title:'ESPERANZA 9 — LA LUZ QUE NO SE APAGA',text:'El espíritu de Dol Amroth resplandece con fuerza. Sus habitantes conservan la esperanza, honran sus compromisos y permanecen unidos frente a las dificultades. La generosidad supera a la codicia, la compasión prevalece sobre la crueldad y el valor permite enfrentar incluso los temores más profundos. La Sombra nunca desaparece por completo de la Tierra Media, pero encuentra en estas tierras corazones firmes que se niegan a entregarse a ella. La luz de Dol Amroth permanece viva.'}
};
let currentSmialLightLevel=5;
function renderSmialLevelNarrative(){
 const level=Math.max(1,Math.min(9,Number(currentSmialLightLevel)||5));
 const fallback=SMIAL_LEVEL_NARRATIVES[level];
 const title=siteSettings['shadow_level_'+level+'_title']||fallback.title;
 const body=siteSettings['shadow_level_'+level+'_text']||fallback.text;
 const titleEl=document.getElementById('smial-level-title');
 const textEl=document.getElementById('smial-level-text');
 if(titleEl)titleEl.textContent=title;
 if(textEl)textEl.textContent=body;
}

async function loadShadowState(){
 const {data:state,error}=await db.from('smial_state').select('*').eq('id',1).single();if(error)return;
 document.getElementById('smial-light').textContent=state.light_level+'/10';
 document.getElementById('smial-shadow').textContent=state.shadow_level+'/10';
 document.getElementById('smial-light-bar').style.width=(state.light_level*10)+'%';
 document.getElementById('smial-shadow-bar').style.width=(state.shadow_level*10)+'%';
 document.getElementById('smial-state-label').textContent=state.light_level<3?'EL SMIAL ESTÁ CONSUMIDO':state.shadow_level>state.light_level?'LA SOMBRA DOMINA':state.light_level>state.shadow_level?'LA ESPERANZA RESISTE':'ESPERANZA Y SOMBRA ESTÁN EN EQUILIBRIO';
 currentSmialLightLevel=Number(state.light_level)||5;
 renderSmialLevelNarrative();
 document.getElementById('smial-counts').textContent='Promedio calculado sobre los 16 miembros del Smial, tengan o no personaje. Se redondea al entero más cercano.';
 await loadActiveShadowEvent();
}
loadPhotoGallery();
loadApproved();loadEvents();loadLoreChronicle();loadLoreScenarios();loadShadowState();loadSiteSettings();refreshAdmin();refreshMemberLogin();


/* v2.7.2 — galería pública y medidor de almacenamiento */
let photoGalleryItems=[];
const galleryVisibleTitle=name=>String(name||'').replace(/\.[^.]+$/,'').replace(/__[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,'');
let photoGalleryPage=1;
const PHOTO_PAGE_SIZE=10;
const STORAGE_FREE_QUOTA=1000000000;
const formatStorageBytes=bytes=>{const value=Math.max(0,Number(bytes)||0);if(value>=1000000000)return(value/1000000000).toFixed(2)+' GB';if(value>=1000000)return(value/1000000).toFixed(2)+' MB';if(value>=1000)return(value/1000).toFixed(1)+' KB';return Math.round(value)+' bytes';};
async function loadGalleryMetadata(){
 const {data,error}=await db.from('site_settings').select('settings').eq('id',1).maybeSingle();
 if(error)throw error;
 const value=data?.settings?.gallery_metadata;
 return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}
async function saveGalleryMetadata(metadata){
 const {data,error:readError}=await db.from('site_settings').select('settings').eq('id',1).single();
 if(readError)throw readError;
 const settings={...(data?.settings||{}),gallery_metadata:metadata};
 const {data:{session}}=await db.auth.getSession();
 const {error}=await db.from('site_settings').upsert({id:1,settings,updated_at:new Date().toISOString(),updated_by:session?.user?.id||null},{onConflict:'id'});
 if(error)throw error;
 siteSettings={...siteSettings,...settings};
}
async function loadPhotoGallery(){
 const host=document.getElementById('photo-gallery-grid');if(!host)return;host.innerHTML='<p class="photo-gallery-message">Cargando fotografías...</p>';
 try{
  const [{data,error},metadata]=await Promise.all([
   db.storage.from('smial-media').list('galeria',{limit:1000,offset:0,sortBy:{column:'created_at',order:'desc'}}),
   loadGalleryMetadata()
  ]);
  if(error)throw error;
  photoGalleryItems=(data||[]).filter(item=>item.id&&item.name&&!item.name.startsWith('.')).map((item,index)=>{
   const path='galeria/'+item.name,custom=metadata[path]||{};
   return{name:item.name,path,url:db.storage.from('smial-media').getPublicUrl(path).data.publicUrl,title:custom.title||galleryVisibleTitle(item.name).replace(/[-_]+/g,' '),sort_order:Number.isFinite(Number(custom.sort_order))?Number(custom.sort_order):index+1};
  }).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));
  photoGalleryPage=1;renderPhotoGallery();
 }catch(error){host.innerHTML='<p class="photo-gallery-message">No fue posible cargar la galería. '+escapeHtml(error.message||'')+'</p>';}
}
function renderPhotoGallery(){
 const host=document.getElementById('photo-gallery-grid');if(!host)return;const empty=document.getElementById('photo-gallery-empty');const pager=document.getElementById('photo-gallery-pagination');
 if(!photoGalleryItems.length){host.innerHTML='';empty.hidden=false;pager.hidden=true;return;}empty.hidden=true;
 const pages=Math.max(1,Math.ceil(photoGalleryItems.length/PHOTO_PAGE_SIZE));photoGalleryPage=Math.min(Math.max(1,photoGalleryPage),pages);
 const visible=photoGalleryItems.slice((photoGalleryPage-1)*PHOTO_PAGE_SIZE,photoGalleryPage*PHOTO_PAGE_SIZE);
 host.innerHTML=visible.map((item,index)=>{const label=item.title;return'<button type="button" class="photo-gallery-card" data-photo-index="'+((photoGalleryPage-1)*PHOTO_PAGE_SIZE+index)+'" aria-label="Ampliar fotografía: '+escapeHtml(label)+'"><img src="'+escapeHtml(item.url)+'" alt="'+escapeHtml(label)+'" loading="lazy"><span>'+escapeHtml(label)+'</span></button>';}).join('');
 host.querySelectorAll('[data-photo-index]').forEach(button=>button.addEventListener('click',()=>{const item=photoGalleryItems[Number(button.dataset.photoIndex)];if(!item)return;const dialog=document.getElementById('photo-lightbox');document.getElementById('photo-lightbox-image').src=item.url;document.getElementById('photo-lightbox-image').alt=item.title;document.getElementById('photo-lightbox-caption').textContent=item.title;if(dialog.showModal)dialog.showModal();else window.open(item.url,'_blank','noopener');}));
 pager.hidden=pages<=1;document.getElementById('photo-gallery-page-label').textContent='Página '+photoGalleryPage+' de '+pages+' · '+photoGalleryItems.length+' fotografías';document.getElementById('photo-gallery-prev').disabled=photoGalleryPage<=1;document.getElementById('photo-gallery-next').disabled=photoGalleryPage>=pages;
}
document.getElementById('photo-gallery-prev')?.addEventListener('click',()=>{photoGalleryPage--;renderPhotoGallery();});
document.getElementById('photo-gallery-next')?.addEventListener('click',()=>{photoGalleryPage++;renderPhotoGallery();});
document.getElementById('photo-lightbox-close')?.addEventListener('click',()=>document.getElementById('photo-lightbox').close());
document.getElementById('photo-lightbox')?.addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
const uploadGalleryImage=async(file)=>{
 if(!file)throw new Error('No se seleccionó ningún archivo.');
 const mimeByExt={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
 const ext=(file.name||'').split('.').pop().toLowerCase();
 const mime=['image/jpeg','image/png','image/webp'].includes(file.type)?file.type:mimeByExt[ext];
 if(!mime)throw new Error('Formato no permitido. Selecciona una imagen JPG, PNG o WebP.');
 const converted=await imageToWebP(file);
 const originalBase=(file.name||'imagen').replace(/\.[^.]+$/,'').replace(/[\\\\/?%*:|"<>]/g,'-').trim()||'imagen';
 const unique=(globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const path='galeria/'+originalBase+'__'+unique+'.webp';
 if(converted.size>6*1024*1024&&window.tus?.Upload){
  const {data:{session}}=await db.auth.getSession();
  if(!session?.access_token)throw new Error('La sesión administrativa ha expirado. Vuelve a iniciar sesión.');
  await new Promise((resolve,reject)=>{
   const upload=new window.tus.Upload(converted,{
    endpoint:'https://heuxofiaijgpwzvrbvoa.storage.supabase.co/storage/v1/upload/resumable',
    retryDelays:[0,3000,5000,10000,20000],
    headers:{authorization:'Bearer '+session.access_token,apikey:SUPABASE_KEY},
    uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,
    chunkSize:6*1024*1024,
    metadata:{bucketName:'smial-media',objectName:path,contentType:'image/webp',cacheControl:'3600',metadata:JSON.stringify({original_name:file.name||'imagen'})},
    onError:reject,onSuccess:resolve
   });
   upload.start();
  });
 }else{
  const {data,error}=await db.storage.from('smial-media').upload(path,converted,{contentType:'image/webp',upsert:false,cacheControl:'3600'});
  if(error)throw error;
  if(!data?.path)throw new Error('Supabase no confirmó la ruta del archivo.');
 }
 return path;
};
async function loadGalleryAdmin(){
 const host=document.getElementById('photo-admin-list');if(!host)return;
 host.innerHTML='<p class="admin-hint">Cargando imágenes guardadas...</p>';
 try{
  const [{data,error},metadata]=await Promise.all([
   db.storage.from('smial-media').list('galeria',{limit:1000,offset:0,sortBy:{column:'created_at',order:'desc'}}),
   loadGalleryMetadata()
  ]);
  if(error)throw error;
  const items=(data||[]).filter(item=>item.id&&item.name&&!item.name.startsWith('.')).map((item,index)=>{
   const path='galeria/'+item.name,custom=metadata[path]||{};
   return{item,path,custom,position:Number.isFinite(Number(custom.sort_order))?Number(custom.sort_order):index+1};
  }).sort((a,b)=>a.position-b.position||a.item.name.localeCompare(b.item.name));
  if(!items.length){host.innerHTML='<p class="admin-hint">No hay imágenes guardadas en la galería.</p>';return;}
  host.innerHTML=items.map(({item,path,custom,position})=>{
   const url=db.storage.from('smial-media').getPublicUrl(path).data.publicUrl;
   const format=(item.name.split('.').pop()||item.metadata?.mimetype||'desconocido').toUpperCase();
   const size=item.metadata?.size?formatStorageBytes(item.metadata.size):'Tamaño no informado';
   const title=custom.title||galleryVisibleTitle(item.name).replace(/[-_]+/g,' ');
   return '<article class="photo-admin-item"><img src="'+escapeHtml(url)+'" alt="" loading="lazy"><div class="photo-admin-meta"><label>Nombre visible<input class="photo-admin-title" type="text" maxlength="120" value="'+escapeHtml(title)+'" data-photo-title="'+escapeHtml(path)+'"></label><label>Posición en la galería<input class="photo-admin-position" type="number" min="1" step="1" value="'+position+'" data-photo-position="'+escapeHtml(path)+'"></label><span>Formato guardado: '+escapeHtml(format)+'</span><span>'+escapeHtml(size)+'</span><button type="button" class="button button-dark photo-admin-save" data-photo-save="'+escapeHtml(path)+'">Guardar cambios</button></div><button type="button" class="button button-outline-dark photo-admin-delete" data-photo-path="'+escapeHtml(path)+'">Eliminar</button></article>';
  }).join('');
  host.querySelectorAll('[data-photo-save]').forEach(button=>button.addEventListener('click',async()=>{
   const path=button.dataset.photoSave,titleInput=host.querySelector('[data-photo-title="'+CSS.escape(path)+'"]'),positionInput=host.querySelector('[data-photo-position="'+CSS.escape(path)+'"]');
   const title=titleInput?.value.trim(),position=Number(positionInput?.value);
   if(!title){say('photo-upload-feedback','El nombre visible no puede quedar vacío.');titleInput?.focus();return;}
   if(!Number.isInteger(position)||position<1||position>items.length){say('photo-upload-feedback','La posición debe ser un número entre 1 y '+items.length+'.');positionInput?.focus();return;}
   button.disabled=true;
   try{
    const current=await loadGalleryMetadata();
    const orderedPaths=items.map(entry=>entry.path);
    const previousIndex=orderedPaths.indexOf(path);
    if(previousIndex<0)throw new Error('La imagen ya no está disponible en la galería.');
    orderedPaths.splice(previousIndex,1);
    orderedPaths.splice(position-1,0,path);
    orderedPaths.forEach((orderedPath,index)=>{
     const entry=items.find(value=>value.path===orderedPath);
     current[orderedPath]={...(current[orderedPath]||{}),title:orderedPath===path?title:(current[orderedPath]?.title||galleryVisibleTitle(entry?.item.name).replace(/[-_]+/g,' ')),sort_order:index+1};
    });
    await saveGalleryMetadata(current);
    await Promise.all([loadGalleryAdmin(),loadPhotoGallery()]);
    say('photo-upload-feedback','Nombre y posición guardados correctamente.');
   }catch(error){say('photo-upload-feedback','No se pudieron guardar los cambios: '+(error.message||'Error desconocido'));button.disabled=false;}
  }));
  host.querySelectorAll('[data-photo-path]').forEach(button=>button.addEventListener('click',async()=>{
   const path=button.dataset.photoPath;
   if(!path||!confirm('¿Eliminar definitivamente esta imagen de la galería?'))return;
   button.disabled=true;
   try{
    const {error}=await db.storage.from('smial-media').remove([path]);
    if(error)throw error;
    const metadata=await loadGalleryMetadata();delete metadata[path];await saveGalleryMetadata(metadata);
    await Promise.all([loadGalleryAdmin(),loadPhotoGallery(),loadStorageUsage()]);
    say('photo-upload-feedback','Imagen eliminada correctamente.');
   }catch(error){say('photo-upload-feedback','No se pudo eliminar la imagen: '+(error.message||'Error desconocido'));button.disabled=false;}
  }));
 }catch(error){host.innerHTML='<p class="admin-hint">No se pudo cargar la administración de imágenes: '+escapeHtml(error.message||'')+'</p>';}
}
document.getElementById('photo-upload-form')?.addEventListener('submit',async event=>{
 event.preventDefault();
 const input=document.getElementById('photo-upload-files');
 const files=[...(input.files||[])];
 const button=document.getElementById('photo-upload-submit');
 if(!files.length){say('photo-upload-feedback','Selecciona al menos una imagen.');return;}
 button.disabled=true;input.disabled=true;
 let uploaded=0;const failures=[];
 try{
  for(let index=0;index<files.length;index++){
   const file=files[index];
   say('photo-upload-feedback','Convirtiendo y subiendo '+(index+1)+' de '+files.length+': '+file.name);
   try{await uploadGalleryImage(file);uploaded++;}
   catch(error){failures.push(file.name+': '+(error.message||'Error desconocido'));}
  }
  input.value='';
  await Promise.all([loadPhotoGallery(),loadGalleryAdmin(),loadStorageUsage()]);
  say('photo-upload-feedback',uploaded+' de '+files.length+' imágenes subidas correctamente.'+(failures.length?' Errores: '+failures.join(' | '):''));
 }finally{button.disabled=false;input.disabled=false;}
});
function renderStorageUsage(data){const used=Math.max(0,Number(data?.used_bytes)||0);const count=Math.max(0,Number(data?.file_count)||0);const remaining=Math.max(0,STORAGE_FREE_QUOTA-used);const percent=Math.min(100,used/STORAGE_FREE_QUOTA*100);document.getElementById('storage-used').textContent=formatStorageBytes(used)+' utilizados';document.getElementById('storage-remaining').textContent=formatStorageBytes(remaining)+' disponibles estimados';document.getElementById('storage-usage-bar').style.width=percent+'%';const track=document.querySelector('.storage-usage-track');track?.setAttribute('aria-valuenow',percent.toFixed(2));document.getElementById('storage-usage-detail').textContent=count+' archivos en smial-media · '+percent.toFixed(2)+'% de la referencia de 1 GB. El límite Free se comparte entre los proyectos de la organización; este medidor cuenta solo este proyecto.';}
async function loadStorageUsage(){const feedback=document.getElementById('storage-usage-feedback');if(!feedback)return;feedback.textContent='Actualizando medición...';try{const {data,error}=await db.rpc('get_smial_storage_usage');if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('No se recibió información de almacenamiento.');renderStorageUsage(row);feedback.textContent='Medición actualizada: '+new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}catch(error){feedback.textContent='No se pudo consultar el espacio: '+(error.message||'Error desconocido');}}
document.getElementById('storage-usage-refresh')?.addEventListener('click',loadStorageUsage);
let storageUsageInterval=null;

/* Navegación interna del panel de administración */
function initAdminTabs(){
 const tabs=[...document.querySelectorAll('[data-admin-tab]')];
 const panels=[...document.querySelectorAll('#admin-dashboard .admin-tab-panel')];
 if(!tabs.length||!panels.length)return;
 const activate=tab=>{
  const target=tab.dataset.adminTab;
  tabs.forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));});
  panels.forEach(panel=>{const active=panel.id===target;panel.classList.toggle('active',active);panel.hidden=!active;});
 };
 tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab)));
 activate(tabs.find(tab=>tab.dataset.adminTab==='admin-tab-home')||tabs[0]);
 const photoTab=tabs.find(tab=>tab.dataset.adminTab==='admin-tab-photos');
 if(photoTab)photoTab.addEventListener('click',()=>{loadStorageUsage();loadGalleryAdmin();if(storageUsageInterval)clearInterval(storageUsageInterval);storageUsageInterval=setInterval(loadStorageUsage,30000);});
 tabs.filter(tab=>tab.dataset.adminTab!=='admin-tab-photos').forEach(tab=>tab.addEventListener('click',()=>{if(storageUsageInterval){clearInterval(storageUsageInterval);storageUsageInterval=null;}}));
}
initAdminTabs();

// Versión 2.7.30
// Controles de playlist mediante YouTube IFrame Player API.
(function initSmialMusicPlayer(){
 const toggle=document.getElementById('music-player-toggle'),prev=document.getElementById('music-prev'),next=document.getElementById('music-next'),volume=document.getElementById('music-volume'),iframe=document.getElementById('music-player-iframe'),status=document.getElementById('music-track-status');
 if(!toggle||!prev||!next||!volume||!iframe)return;
 const playlist='PLpf9zAOOy1KxwDUc6ZHgeforxG1tLJ13y';let player=null,ready=false,playing=false;
 const setPlaying=v=>{playing=v;toggle.textContent=v?'Ⅱ':'▶';toggle.setAttribute('aria-pressed',String(v));toggle.setAttribute('aria-label',v?'Pausar música':'Reproducir música');if(status)status.textContent=v?'Reproduciendo':'En pausa';};
 function createPlayer(){if(player||!window.YT||!YT.Player)return;player=new YT.Player(iframe,{events:{onReady:e=>{ready=true;e.target.setVolume(+volume.value);e.target.cuePlaylist({listType:'playlist',list:playlist,index:0});},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING)setPlaying(true);if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.ENDED)setPlaying(false);}}});}
 function loadApi(){if(window.YT&&YT.Player){createPlayer();return;}if(!document.querySelector('script[data-youtube-iframe-api]')){const tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';tag.dataset.youtubeIframeApi='true';document.head.appendChild(tag);}const prior=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(typeof prior==='function')prior();createPlayer();};}
 toggle.addEventListener('click',()=>{if(!ready){loadApi();if(status)status.textContent='Preparando reproductor…';const timer=setInterval(()=>{if(ready){clearInterval(timer);player.playVideo();}},200);setTimeout(()=>clearInterval(timer),15000);return;}if(playing)player.pauseVideo();else player.playVideo();});
 prev.addEventListener('click',()=>{if(ready)player.previousVideo();else{loadApi();if(status)status.textContent='Preparando reproductor…';}});
 next.addEventListener('click',()=>{if(ready)player.nextVideo();else{loadApi();if(status)status.textContent='Preparando reproductor…';}});
 volume.addEventListener('input',()=>{if(ready)player.setVolume(+volume.value);});
 loadApi();
})();
