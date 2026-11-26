import {mkdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join} from "node:path";
const assets={"ship-lysa-exploration.png":"a2e0e7c09e2ed5ed292f3cf6a634cd957067857f","ship-seris-combat.png":"922c6ab9747a956e2403ac832a110c4b9ce1255c","lysa-dialogue-realistic.png":"fb22b0fb5c15a2a3159c72292c00620c67637cc1","character-dialogue-avatar.png":"dbf7cab0dda6839d07eeb808ca7770e154450327","character-grand-avatar.png":"a424af4f60763323e29ac1581f429ac79a3a40cb"};
const dir=join(process.cwd(),"public","combat");
await mkdir(dir,{recursive:true});
const digest=bytes=>createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
await Promise.all(Object.entries(assets).map(async ([name,sha])=>{
  const target=join(dir,name);
  try {
    try {if(digest(await readFile(target))===sha)return;}catch{}
    const response=await fetch("https://raw.githubusercontent.com/ShiivMods/GaiaRP/6a5324d5bea9758c94e19305bc8c3e25979897e8/public/"+name,{signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error(String(response.status));
    const bytes=Buffer.from(await response.arrayBuffer());
    if(digest(bytes)!==sha)throw new Error("Empreinte incorrecte");
    await writeFile(target,bytes);
  }catch(error){console.warn("Illustration de la maquette indisponible : "+name+" ("+error.message+"). Le jeu reste utilisable.");}
}));
