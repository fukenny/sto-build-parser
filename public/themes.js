// Palette inspiration: https://www.thelcars.com/colors.php and /themes/.
// Values and role mappings are our own bundled CSS; no runtime site access.
export const themes=[{id:'shakedown',label:'Shakedown'},{id:'amber',label:'Lower Decks'},{id:'classic',label:'TNG'},{id:'voyager',label:'Voyager'}];
export function themeById(id){return themes.find(theme=>theme.id===id);}
export function applyTheme(id){
 const theme=themeById(id)||themes[0];
 document.body.dataset.theme=theme.id;
 return theme.id;
}
