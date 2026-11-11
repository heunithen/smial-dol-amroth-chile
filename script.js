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

const SITE_DEFAULTS={"announcement":"Un hogar para quienes mantienen viva la llama de la Tierra Media","site_title":"SMIAL DOL AMROTH","brand_subtitle":"CHILE · TIERRA MEDIA","hero_eyebrow":"GONDOR · BELFALAS · CHILE","hero_title":"Donde el mar\nencuentra la leyenda.","hero_intro":"Somos el Smial Dol Amroth de Chile: una comunidad que celebra la obra de J. R. R. Tolkien, comparte historias y construye nuevas aventuras en compañía.","hero_caption":"EN LAS COSTAS DE BELFALAS · UNA COMUNIDAD, MUCHAS HISTORIAS","hero_seal_title":"DOL\nAMROTH","hero_seal_subtitle":"EST. IN MIDDLE-EARTH","lore_title":"Una historia junto\nal Gran Mar.","lore_intro":"Inspirados por las costas de Gondor y el legado de sus gentes, encontramos en la Tierra Media un lugar para imaginar, aprender y compartir.","events_title":"Las historias\nse viven juntos.","events_intro":"Reuniones, conversaciones, lecturas y actividades para compartir nuestra afición por Tolkien.","members_title":"Rostros e historias\nde nuestra casa.","members_intro":"Cada integrante puede dar vida a un personaje con identidad, historia y lugar dentro del universo narrativo del Smial. Las Medallas de Dol Amroth reconocen la ayuda, la iniciativa, la organización y los aportes que fortalecen nuestra comunidad.","shadow_title":"La Sombra\nse extiende.","shadow_intro":"Desde el Este crece una amenaza. La Sombra de Mordor se cierne sobre nuestras tierras y solo la unión de la comunidad podrá mantenerla a raya.","about_title":"Una casa para\nla imaginación.","about_intro":"El Smial Dol Amroth de Chile es un espacio de encuentro para personas que comparten su interés por el legendarium de J. R. R. Tolkien. Nos reúne la lectura, la conversación, la creatividad y el gusto por construir comunidad.","about_text":"Queremos que este sitio sea la puerta de entrada a nuestras actividades y también el archivo vivo de las historias que vamos creando como grupo.","register_title":"Hay sitio en la mesa\npara una historia más.","register_intro":"¿Quieres formar parte del Smial? Completa tus datos para solicitar ingreso. La administración revisará tu solicitud y, si la aprueba, podrás ingresar con tu correo y contraseña.","footer_text":"Una comunidad inspirada en la obra de J. R. R. Tolkien.","paper":"#f4f2ed","ink":"#1a2939","announcement_text_color":"#c4ccd5","lore_card_background":"#efeee9","lore_card_title_color":"#20364d","lore_card_text_color":"#465766","lore_card_label_color":"#9a8558","lore_card_border_color":"#d6d9d6","nav_text_color":"#455363","nav_active_color":"#9b8355","nav_register_text_color":"#203a55","nav_register_border_color":"#9caaaf","heading_color":"#101f35","text_color":"#1a2939","muted_color":"#687582","border_color":"#c8d2dc","navy":"#101f35","blue":"#24486b","gold":"#b9a477","serif":"Cinzel","sans":"Manrope","hero_image_path":"","logo_image_path":"","about_logo_image_path":"","shadow_background_image_path":"","global_content_width":1120,"global_section_spacing":76,"global_radius":8,"home_overlay":65,"home_height":720,"home_title_size":78,"home_intro_size":15,"home_content_width":650,"home_seal_size":150,"lore_bg":"#111b2b","lore_title_color":"#f4f6f8","lore_text_color":"#b6c0cb","lore_card_radius":8,"lore_text_size":17,"lore_content_width":1100,"lore_section_padding":76,"events_bg":"#0b1728","events_title_color":"#f0f1ee","events_text_color":"#bac5cd","events_card_bg":"#14283f","events_card_radius":8,"events_image_height":300,"events_section_padding":76,"members_bg":"#111b2b","members_title_color":"#f4f6f8","members_text_color":"#b6c0cb","members_card_bg":"#1a293c","members_card_radius":8,"members_image_size":180,"shadow_bg":"#0a1523","shadow_title_color":"#edf0ec","shadow_text_color":"#b9c3ca","shadow_card_bg":"#101b29","shadow_art_height":460,"shadow_overlay":55,"about_bg":"#111b2b","about_title_color":"#f4f6f8","about_text_color":"#b6c0cb","about_emblem_size":338,"about_section_padding":76,"register_bg":"#101f35","register_title_color":"#f4f6f8","register_text_color":"#c1cbd2","register_form_bg":"#172b40","register_input_bg":"#29415a","register_input_text":"#f5f6f7","register_input_border":"#596a7a","register_button_bg":"#b9a477","register_button_text":"#101f35","register_radius":8,"header_bg":"#f8f7f3","header_height":88,"header_logo_size":110,"announcement_bg":"#0a1627","announcement_bg_text":"#c4ccd5","announcement_height":34,"footer_bg":"#101f35","footer_text_color":"#d2d9df","button_bg":"#0b1728","button_text":"#f5f6f7","button_border":"#294763","button_radius":4,"input_bg":"#29415a","input_text":"#f5f6f7","input_border":"#596a7a","input_radius":6};
let siteSettings={...SITE_DEFAULTS};

const DESIGN_CONTROLS={"general":[["paper","Fondo general","color"],["heading_color","Color de títulos","color"],["text_color","Texto principal","color"],["muted_color","Texto secundario","color"],["border_color","Bordes y separadores","color"],["announcement_text_color","Texto de la franja superior","color"],["navy","Azul oscuro institucional","color"],["blue","Azul secundario","color"],["gold","Dorado institucional","color"],["serif","Tipografía de títulos","select",["Cinzel","Georgia"]],["sans","Tipografía general","select",["Manrope","Arial","Georgia"]],["global_content_width","Ancho máximo del contenido (px)","number",600,1600],["global_section_spacing","Separación vertical general (px)","number",20,160],["global_radius","Redondeo general de tarjetas (px)","number",0,32]],"home":[["home_overlay","Oscurecimiento de la imagen (%)","number",0,90],["home_height","Altura de portada (px)","number",420,1000],["home_title_size","Tamaño del título (px)","number",32,110],["home_intro_size","Tamaño de presentación (px)","number",12,26],["home_content_width","Ancho del bloque de texto (px)","number",350,1000],["home_seal_size","Tamaño del sello circular (px)","number",80,260]],"lore":[["lore_bg","Fondo de la sección","color"],["lore_title_color","Color del título","color"],["lore_text_color","Color del texto","color"],["lore_card_background","Fondo de las entradas","color"],["lore_card_title_color","Título de las entradas","color"],["lore_card_text_color","Texto de las entradas","color"],["lore_card_label_color","Etiquetas y fechas","color"],["lore_card_border_color","Borde de las entradas","color"],["lore_text_size","Tamaño del texto narrativo (px)","number",12,24],["lore_content_width","Ancho máximo del contenido (px)","number",500,1400],["lore_section_padding","Espaciado interior (px)","number",20,160],["lore_card_radius","Redondeo de tarjetas (px)","number",0,32]],"events":[["events_bg","Fondo de la sección","color"],["events_title_color","Color de títulos","color"],["events_text_color","Color del texto","color"],["events_card_bg","Fondo de tarjetas de eventos","color"],["events_card_radius","Redondeo de tarjetas (px)","number",0,32],["events_image_height","Altura máxima de imágenes (px)","number",100,700],["events_section_padding","Espaciado interior (px)","number",20,160]],"members":[["members_bg","Fondo de la sección","color"],["members_title_color","Color de títulos","color"],["members_text_color","Color del texto","color"],["members_card_bg","Fondo de fichas de personajes","color"],["members_card_radius","Redondeo de fichas (px)","number",0,32],["members_image_size","Tamaño de imagen de personaje (px)","number",80,320]],"shadow":[["shadow_bg","Fondo de la sección","color"],["shadow_title_color","Color de títulos","color"],["shadow_text_color","Color del texto","color"],["shadow_card_bg","Fondo del acontecimiento activo","color"],["shadow_art_height","Altura del paisaje (px)","number",180,800],["shadow_overlay","Oscurecimiento del paisaje (%)","number",0,90]],"about":[["about_bg","Fondo de la sección","color"],["about_title_color","Color de títulos","color"],["about_text_color","Color del texto","color"],["about_emblem_size","Ancho máximo del emblema (px)","number",100,600],["about_section_padding","Espaciado interior (px)","number",20,160]],"register":[["register_bg","Fondo de la sección","color"],["register_title_color","Color del título","color"],["register_text_color","Color del texto","color"],["register_form_bg","Fondo del formulario","color"],["register_input_bg","Fondo de los campos","color"],["register_input_text","Texto de los campos","color"],["register_input_border","Borde de los campos","color"],["register_button_bg","Fondo de botones","color"],["register_button_text","Texto de botones","color"],["register_radius","Redondeo de campos y botones (px)","number",0,32]],"navigation":[["header_bg","Fondo del encabezado","color"],["header_height","Altura del encabezado (px)","number",56,150],["header_logo_size","Tamaño del emblema (px)","number",40,160],["nav_text_color","Color de enlaces","color"],["nav_active_color","Color de enlace seleccionado","color"],["nav_register_text_color","Texto del botón Registro","color"],["nav_register_border_color","Borde del botón Registro","color"],["announcement_bg","Fondo de la franja superior","color"],["announcement_bg_text","Texto de la franja superior","color"],["announcement_height","Altura de la franja superior (px)","number",20,70],["footer_bg","Fondo del pie de página","color"],["footer_text_color","Texto del pie de página","color"]],"components":[["button_bg","Fondo de botones generales","color"],["button_text","Texto de botones generales","color"],["button_border","Borde de botones generales","color"],["button_radius","Redondeo de botones (px)","number",0,30],["input_bg","Fondo de campos","color"],["input_text","Texto de campos","color"],["input_border","Borde de campos","color"],["input_radius","Redondeo de campos (px)","number",0,30]]};
function buildDesignControls(){
 Object.entries(DESIGN_CONTROLS).forEach(([group,fields])=>{const host=document.querySelector('[data-design-panel="'+group+'"]');if(!host)return;const wrap=document.createElement('div');wrap.className='customizer-grid';fields.forEach(([key,label,type,a,b])=>{const box=document.createElement('div');box.className='customizer-group design-control-group';const lab=document.createElement('label');lab.textContent=label;let input;if(type==='select'){input=document.createElement('select');a.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);});}else{input=document.createElement('input');input.type=type;if(type==='number'){input.min=a;input.max=b;input.step=1;input.inputMode='numeric';}}input.dataset.setting=key;lab.append(input);box.append(lab);wrap.append(box);});host.append(wrap);});
 document.querySelectorAll('[data-design-tab]').forEach(tab=>tab.addEventListener('click',()=>{const key=tab.dataset.designTab;document.querySelectorAll('[data-design-tab]').forEach(x=>{const active=x===tab;x.classList.toggle('active',active);x.setAttribute('aria-selected',String(active));});document.querySelectorAll('[data-design-panel]').forEach(panel=>{const active=panel.dataset.designPanel===key;panel.classList.toggle('active',active);panel.hidden=!active;});}));
}
buildDesignControls();
const settingFields=[...document.querySelectorAll('#admin-dashboard [data-setting]')];
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
 '.hero h1{font-size:'+px('home_title_size')+'!important}.hero-intro{font-size:'+px('home_intro_size')+'!important;max-width:'+px('home_content_width')+'!important}.hero-seal{width:'+px('home_seal_size')+';height:'+px('home_seal_size')+'}',
 '#lore{background:'+color('lore_bg')+';padding-top:'+px('lore_section_padding')+';padding-bottom:'+px('lore_section_padding')+'}#lore #lore-title{color:'+color('lore_title_color')+'}#lore .section-lead,#lore .event-lore-content{color:'+color('lore_text_color')+'}#lore .lore-chapter{background:'+color('lore_card_background')+';border-color:'+color('lore_card_border_color')+';border-radius:'+px('lore_card_radius')+'}#lore .lore-chapter h3{color:'+color('lore_card_title_color')+'}#lore .lore-chapter .event-lore-content{color:'+color('lore_card_text_color')+';font-size:'+px('lore_text_size')+';max-width:'+px('lore_content_width')+'}#lore .lore-date,#lore .lore-inline-date{color:'+color('lore_card_label_color')+'}',
 '#eventos{background:'+color('events_bg')+';padding-top:'+px('events_section_padding')+';padding-bottom:'+px('events_section_padding')+'}#eventos #events-title{color:'+color('events_title_color')+'}#eventos .section-lead,#eventos .public-event{color:'+color('events_text_color')+'}#eventos .public-event{background:'+color('events_card_bg')+';border-radius:'+px('events_card_radius')+'}#eventos .public-event-image{max-height:'+px('events_image_height')+'}',
 '#miembros{background:'+color('members_bg')+'}#miembros #members-title{color:'+color('members_title_color')+'}#miembros .section-lead,#miembros .approved-card{color:'+color('members_text_color')+'}#miembros .approved-card{background:'+color('members_card_bg')+';border-radius:'+px('members_card_radius')+'}#miembros .approved-card>img{width:'+px('members_image_size')+';height:'+px('members_image_size')+';object-fit:cover}',
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
 
 const text=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value||'';};
 const title=(id,value)=>{const el=document.getElementById(id);if(el)el.innerHTML=escapeHtml(value||'').replace(/\n/g,'<br>');};
 text('announcement-copy',s.announcement);text('brand-site-title',s.site_title);text('brand-site-subtitle',s.brand_subtitle);
 text('hero-eyebrow',s.hero_eyebrow);title('hero-title',s.hero_title);text('hero-intro',s.hero_intro);text('hero-caption',s.hero_caption);title('hero-seal-title',s.hero_seal_title);text('hero-seal-subtitle',s.hero_seal_subtitle);
 title('lore-title',s.lore_title);text('lore-intro',s.lore_intro);title('events-title',s.events_title);text('events-intro',s.events_intro);
 title('members-title',s.members_title);text('members-intro',s.members_intro);title('shadow-title',s.shadow_title);text('shadow-intro',s.shadow_intro);
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
function fillSiteSettingsForm(){
 settingFields.forEach(el=>{const key=el.dataset.setting;el.value=siteSettings[key]??SITE_DEFAULTS[key]??'';});
 [['hero','hero_image_path'],['logo','logo_image_path'],['about-logo','about_logo_image_path'],['shadow-background','shadow_background_image_path']].forEach(([kind,key])=>{const host=document.getElementById('site-'+kind+'-preview'),url=settingImageUrl(siteSettings[key]);if(host)host.innerHTML=url?'<img src="'+escapeHtml(url)+'" alt="Imagen actual">':'Sin imagen personalizada';});
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
  e.preventDefault();const button=form.querySelector('button[type="submit"]');button.disabled=true;
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
document.getElementById('site-settings-reset').addEventListener('click',async()=>{
 if(!confirm('¿Restaurar los textos, fondos, bordes, colores institucionales e imágenes originales?'))return;
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
  const {data:{session}}=await db.auth.getSession();const payload={user_id:session?.user?.id||null,real_name:document.getElementById('real-name').value.trim(),tolkien_name:document.getElementById('tolkien-name').value.trim(),role_title:document.getElementById('character-role').value.trim(),story:story.value.trim(),image_path,status:'pending'};
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
async function loadActiveShadowEvent(){const host=document.getElementById('shadow-active-event');if(!host)return;const {data,error}=await db.from('events').select('id,title,description,event_date,event_time,location,lore_title,lore_intro,lore_cover_image_path').eq('status','published').eq('attendance_closed',false).not('lore_scenario_id','is',null).order('event_date',{ascending:true});if(error){host.textContent='No fue posible cargar el acontecimiento activo.';return;}const dataToShow=(data||[]).find(event=>!['el faro apagado'].includes(String(event.lore_title||'').trim().toLocaleLowerCase('es'))&&!['el faro apagado'].includes(String(event.title||'').trim().toLocaleLowerCase('es')));if(!dataToShow){host.innerHTML='<p>No hay acontecimientos activos. El próximo capítulo de la historia está por comenzar.</p>';return;}const cover=dataToShow.lore_cover_image_path?db.storage.from('smial-media').getPublicUrl(dataToShow.lore_cover_image_path).data.publicUrl:'';host.innerHTML='<article class="shadow-active-card"><p class="card-kicker">ACONTECIMIENTO ACTIVO</p><h3>'+escapeHtml(dataToShow.lore_title||dataToShow.title)+'</h3><p>'+escapeHtml(dataToShow.description)+'</p>'+(cover?'<img class="event-lore-cover" src="'+escapeHtml(cover)+'" alt="">':'')+'<div class="event-lore-content">'+sanitizeRich(dataToShow.lore_intro||'')+'</div><small>'+escapeHtml(dataToShow.event_date)+(dataToShow.event_time?' · '+escapeHtml(dataToShow.event_time.slice(0,5)):'')+' · '+escapeHtml(dataToShow.location)+'</small><p class="shadow-pending">PENDIENTE DE RESOLUCIÓN</p></article>';}
async function loadShadowState(){
 const {data:state,error}=await db.from('smial_state').select('*').eq('id',1).single();if(error)return;
 document.getElementById('smial-light').textContent=state.light_level+'/10';
 document.getElementById('smial-shadow').textContent=state.shadow_level+'/10';
 document.getElementById('smial-light-bar').style.width=(state.light_level*10)+'%';
 document.getElementById('smial-shadow-bar').style.width=(state.shadow_level*10)+'%';
 document.getElementById('smial-state-label').textContent=state.light_level<3?'EL SMIAL ESTÁ CONSUMIDO':state.shadow_level>state.light_level?'LA SOMBRA DOMINA':state.light_level>state.shadow_level?'LA ESPERANZA RESISTE':'ESPERANZA Y SOMBRA ESTÁN EN EQUILIBRIO';
 document.getElementById('smial-counts').textContent='Promedio calculado sobre los 16 miembros del Smial, tengan o no personaje. Se redondea al entero más cercano.';
 await loadActiveShadowEvent();
}
loadApproved();loadEvents();loadLoreChronicle();loadLoreScenarios();loadShadowState();loadSiteSettings();refreshAdmin();refreshMemberLogin();


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
}
initAdminTabs();
